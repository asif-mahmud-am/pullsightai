import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Octokit } from '@octokit/rest'
import { HttpService } from 'src/common/http/http.service'
import { StructuredPRData } from 'src/common/interfaces/pr.interface'
import {
    PullRequestResponse,
    Repository
} from 'src/common/interfaces/repository.interface'
import { DatabaseService } from 'src/database/database.service'
import {
    GetPRDto,
    InstallCallbackDto,
    InstallRepoDto,
    PRReviewDto
} from 'src/github/dto/install-repo.dto'
import { GithubEventService } from 'src/github/github-events.service'

@Injectable()
export class GithubService {
    private octokit: Octokit

    constructor(
        private readonly dataService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly githubEventService: GithubEventService,
        private readonly httpService: HttpService
    ) {}

    async getUserOrganizations(user: any) {
        const data = await this.dataService.users
            .findOne({
                _id: user.sub
            })
            .populate({
                path: 'workspaces',
                match: {
                    installationId: {
                        $exists: true,
                        $nin: [null, '', undefined]
                    }
                }
            })
        return data?.workspaces || []
    }

    async createWorkspace(user: any, installRepoDto: InstallRepoDto) {
        await this.initOctokit(user)
        let workspace = await this.dataService.workspaces.findOne({
            id: installRepoDto.id,
            provider: 'github'
        })
        if (!workspace) {
            let org
            if (installRepoDto.type === 'User') {
                const userData =
                    await this.octokit.rest.users.getAuthenticated()
                org = userData.data
            } else {
                const orgData = await this.octokit.rest.orgs.get({
                    org: installRepoDto.name
                })
                org = orgData.data
            }

            workspace = await this.dataService.workspaces.create({
                id: org.id.toString(),
                name: org.login,
                nodeId: org.node_id,
                url: org.url,
                reposUrl: org.repos_url,
                avatarUrl: org.avatar_url,
                type: org.type,
                provider: 'github',
                ownerId: user.sub
            })
        }
        await this.dataService.users.updateOne(
            { _id: user.sub },
            {
                $set: {
                    currentWorkspace: workspace._id
                }
            }
        )
        return workspace
    }
    async initOctokit(user: any) {
        const userData = await this.dataService.users.findOne(
            { _id: user.sub },
            'accessToken'
        )
        if (!userData || !userData.accessToken) {
            throw new Error('User not found or access token missing')
        }
        this.octokit = new Octokit({
            auth: userData.accessToken
        })
        return this.octokit
    }

    async validateAndGetInstalledOrg(installationId: number) {
        const octokit = await this.githubEventService.appAuthenticationJWT()
        const { data } = await octokit.rest.apps.getInstallation({
            installation_id: installationId
        })
        return data.account
    }

    async addInstallOrg(installCallbackDto: InstallCallbackDto) {
        const org: any = await this.validateAndGetInstalledOrg(
            +installCallbackDto.installation_id
        )
        let workspace = await this.dataService.workspaces.findOne({
            id: org.id.toString(),
            provider: 'github'
        })
        if (workspace) {
            const updatedWorkspace =
                await this.dataService.workspaces.findOneAndUpdate(
                    { _id: workspace._id },
                    {
                        $set: {
                            installationId: installCallbackDto.installation_id
                        }
                    },
                    { new: true }
                )
            workspace = updatedWorkspace
        } else {
            workspace = await this.dataService.workspaces.create({
                id: org.id.toString(),
                name: org.login,
                slug: org.login,
                nodeId: org.node_id,
                url: org.url,
                reposUrl: org.repos_url,
                avatarUrl: org.avatar_url,
                type: org.type,
                provider: 'github',
                ownerId: installCallbackDto.state,
                installationId: installCallbackDto.installation_id,
                createdOn: org.created_at,
                isPrivate: org.private
            })
        }

        if (!workspace) {
            throw new InternalServerErrorException(
                'Failed to create or update workspace'
            )
        }

        await this.dataService.users.updateOne(
            { _id: installCallbackDto.state },
            {
                $set: {
                    currentWorkspace: workspace._id
                },
                $addToSet: {
                    workspaces: workspace._id
                }
            }
        )
        return workspace.name
    }

    async listRepoPullRequests(user: any, getPRDto: GetPRDto) {
        const userData = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate('currentWorkspace')
        if (
            !userData ||
            !userData?.currentWorkspace ||
            !userData?.currentWorkspace['installationId']
        ) {
            throw new Error(
                'User or current workspace not found or installation ID missing'
            )
        }
        const octokit = await this.githubEventService.initOctokitApp(
            Number(userData.currentWorkspace['installationId'])
        )

        const query: any = {
            owner: userData.currentWorkspace['name'],
            repo: getPRDto.repo,
            state: 'all',
            per_page: 100
        }

        const { data: pullRequests } = await octokit.rest.pulls.list(query)
        const prList: PullRequestResponse[] = []
        pullRequests.map((pr) => {
            prList.push({
                id: pr.id,
                nodeId: pr.node_id,
                prNumber: pr.number,
                title: pr.title,
                status: pr.state,
                author: {
                    username: pr.user?.login || 'Unknown',
                    avatarUrl: pr.user?.avatar_url || ''
                },
                createdOn: pr.created_at,
                updatedOn: pr.updated_at,
                closedOn: pr.closed_at,
                mergedOn: pr.merged_at,
                url: pr.html_url
            } as PullRequestResponse)
        })
        return prList
    }

    async listOrgRepositories(user: any) {
        const userData = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate('currentWorkspace')
        if (
            !userData ||
            !userData?.currentWorkspace ||
            !userData?.currentWorkspace['installationId']
        ) {
            throw new Error(
                'User or current workspace not found or installation ID missing'
            )
        }
        try {
            await this.validateAndGetInstalledOrg(
                +userData.currentWorkspace['installationId']
            )
        } catch (error) {
            return {
                invalidInstallationId: true,
                message: 'Organization installation not found or invalid'
            }
        }
        await this.validateAndGetInstalledOrg(
            +userData.currentWorkspace['installationId']
        )

        const octokit = await this.githubEventService.initOctokitApp(
            Number(userData.currentWorkspace['installationId'])
        )

        let data
        if (userData.currentWorkspace['type'] === 'User') {
            const repoData =
                await octokit.rest.apps.listReposAccessibleToInstallation({
                    sort: 'created',
                    direction: 'desc'
                })
            data = repoData.data.repositories
        } else {
            data = await octokit.rest.repos.listForOrg({
                org: userData.currentWorkspace['name'],
                type: 'all',
                sort: 'created',
                direction: 'desc'
            })
            data = data.data
        }

        const repositories: Repository[] = data.map(
            (repo) =>
                ({
                    id: repo.id,
                    name: repo.name,
                    fullName: repo.full_name,
                    slug: repo.name,
                    private: repo.private,
                    author: {
                        username: repo.owner.login,
                        avatarUrl: repo.owner.avatar_url
                    },
                    createdOn: repo.created_at,
                    updatedOn: repo.pushed_at,
                    openIssues: repo.open_issues_count
                }) as Repository
        )
        return repositories
    }

    async makePRReview(user: any, prReviewDto: PRReviewDto) {
        const userData = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate('currentWorkspace')
        if (
            !userData ||
            !userData?.currentWorkspace ||
            !userData?.currentWorkspace['installationId']
        ) {
            throw new Error(
                'User or current workspace not found or installation ID missing'
            )
        }

        const octokit = await this.githubEventService.initOctokitApp(
            Number(userData.currentWorkspace['installationId'])
        )

        let pullRequestFormattedData: StructuredPRData =
            await this.githubEventService.createComprehensivePRAnalysis(
                userData.currentWorkspace['name'],
                prReviewDto.repo,
                +prReviewDto.prNumber,
                userData.currentWorkspace['installationId']
            )

        const response = await this.httpService.post(
            this.configService.get('AI_AGENT_PR_REVIEW_URL') as string,
            pullRequestFormattedData
        )
        return {
            ...pullRequestFormattedData,
            ...response
        }
    }

    async processGithubEvent(event: any, payload: any) {
        let pullRequestFormattedData: StructuredPRData | boolean
        switch (event) {
            case 'pull_request':
                pullRequestFormattedData =
                    await this.githubEventService.handleGitHubPullRequest(
                        payload
                    )
                break
            case 'installation':
                await this.githubEventService.handleGitHubInstallation(payload)
            default:
                pullRequestFormattedData = false
        }
        if (pullRequestFormattedData) {
            await this.httpService.post(
                this.configService.get('AI_AGENT_PR_POST_URL') as string,
                pullRequestFormattedData
            )
        }
        return pullRequestFormattedData
    }
}
