import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Octokit } from '@octokit/rest'
import { Types } from 'mongoose'
import { HttpService } from 'src/common/http/http.service'
import { StructuredPRData } from 'src/common/interfaces/pr.interface'
import { Repository } from 'src/common/interfaces/repository.interface'
import { DatabaseService } from 'src/database/database.service'
import { Workspace } from 'src/database/schemas/workspace.schema'
import { InstallRepoDto } from 'src/github/dto/install-repo.dto'
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

    async getUserOrganizations(user: any): Promise<Workspace[]> {
        await this.initOctokit(user)
        const userRepoData = await this.octokit.rest.users.getAuthenticated()
        const response = await this.octokit.rest.orgs.listForAuthenticatedUser()
        const organizations: Workspace[] = []
        organizations.push({
            name: userRepoData.data.login,
            id: userRepoData.data.id.toString(),
            nodeId: userRepoData.data.node_id,
            url: userRepoData.data.url,
            reposUrl: userRepoData.data.repos_url,
            avatarUrl: userRepoData.data.avatar_url,
            type: userRepoData.data.type,
            provider: 'github'
        })
        for (const details of response.data) {
            organizations.push({
                id: details.id.toString(),
                name: details.login,
                nodeId: details.node_id,
                url: details.url,
                reposUrl: details.repos_url,
                avatarUrl: details.avatar_url,
                provider: 'github'
            })
        }
        return organizations
    }

    async createWorkspace(user: any, installRepoDto: InstallRepoDto) {
        await this.initOctokit(user)
        const workspace = await this.dataService.workspaces.findOne({
            id: installRepoDto.id,
            provider: 'github',
            ownerId: new Types.ObjectId(user.sub)
        })
        if (workspace) {
            return workspace
        }
        const { data: org } = await this.octokit.rest.orgs.get({
            org: installRepoDto.name
        })
        return await this.dataService.workspaces.create({
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

    async listInstallationRepositories(installationId: number) {
        const octokit =
            await this.githubEventService.initOctokitApp(installationId)

        const { data } =
            await octokit.rest.apps.listReposAccessibleToInstallation()
        if (data.repositories.length) {
            const org = data.repositories[0].owner
            const workspace = await this.dataService.workspaces.findOne({
                id: org.id.toString(),
                provider: 'github'
            })
            if (workspace) {
                await this.dataService.workspaces.updateOne(
                    {
                        _id: workspace._id
                    },
                    {
                        installationId: installationId.toString()
                    }
                )
            }
        }
        return data.repositories[0].owner.login
    }

    async listOrgRepositories(name: string, installationId: number) {
        const octokit =
            await this.githubEventService.initOctokitApp(installationId)

        const { data } = await octokit.rest.repos.listForOrg({
            org: name,
            type: 'all'
        })

        const repositories: Repository[] = data.map(
            (repo) =>
                ({
                    id: repo.id,
                    nodeId: repo.node_id,
                    name: repo.name,
                    fullName: repo.full_name,
                    private: repo.private,
                    author: {
                        name: repo.owner.login,
                        avatarUrl: repo.owner.avatar_url
                    },
                    pushedAt: repo.pushed_at,
                    openIssues: repo.open_issues_count
                }) as Repository
        )
        return repositories
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
