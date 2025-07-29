import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Octokit } from '@octokit/rest'
import { HttpService } from 'src/common/http/http.service'
import { StructuredPRData } from 'src/common/interfaces/pr.interface'
import { Repository } from 'src/common/interfaces/repository.interface'
import { DatabaseService } from 'src/database/database.service'
import { Workspace } from 'src/database/schemas/workspace.schema'
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
        console.log('User Repo Data:', response.data)
        const organizations: Workspace[] = []
        organizations.push({
            name: userRepoData.data.login,
            id: userRepoData.data.id.toString(),
            nodeId: userRepoData.data.node_id,
            url: userRepoData.data.url,
            reposUrl: userRepoData.data.repos_url,
            avatarUrl: userRepoData.data.avatar_url,
            type: userRepoData.data.type
        })
        for (const org of response.data) {
            const details = await this.octokit.rest.orgs.get({
                org: org.login
            })
            organizations.push({
                id: details.data.id.toString(),
                name: details.data.login,
                nodeId: details.data.node_id,
                url: details.data.url,
                reposUrl: details.data.repos_url,
                avatarUrl: details.data.avatar_url,
                type: details.data.type
            })
        }
        return organizations
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
        if (data.repositories.length === 1) {
            const org = data.repositories[0].owner
            await this.dataService.workspaces.create({
                id: org.id.toString(),
                name: org.login,
                nodeId: org.node_id,
                url: org.url,
                reposUrl: org.repos_url,
                avatarUrl: org.avatar_url,
                type: org.type
            })
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
        console.log('Processing GitHub event:', event)
        let pullRequestFormatedData: StructuredPRData | boolean
        switch (event) {
            case 'pull_request':
                pullRequestFormatedData =
                    await this.githubEventService.handleGitHubPullRequest(
                        payload
                    )
                break
            default:
                pullRequestFormatedData = false
        }
        if (pullRequestFormatedData) {
            await this.httpService.post(
                this.configService.get('AI_AGENT_PR_POST_URL') as string,
                pullRequestFormatedData
            )
        }
        return pullRequestFormatedData
    }
}
