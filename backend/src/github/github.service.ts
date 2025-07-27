import { Injectable } from '@nestjs/common'
import { Octokit } from '@octokit/rest'
import { DatabaseService } from 'src/database/database.service'

export interface Organization {
    name: string
    id: number
    nodeId: string
    url: string
    reposUrl: string
    avatarUrl: string
    createdAt: string
    updatedAt: string
    type: string
}

export interface Repository {
    id: number
    nodeId: string
    name: string
    fullName: string
    private: boolean
    author: {
        name: string
        avatarUrl: string
    }
    pushedAt: string
    openIssues: number
}
@Injectable()
export class GithubService {
    private octokit: Octokit

    constructor(private readonly dataService: DatabaseService) {}

    async getUserOrganizations(user: any): Promise<Organization[]> {
        await this.initOctokit(user)
        const userRepoData = await this.octokit.rest.users.getAuthenticated()
        const response = await this.octokit.rest.orgs.listForAuthenticatedUser()
        const organizations: Organization[] = []
        organizations.push({
            name: userRepoData.data.login,
            id: userRepoData.data.id,
            nodeId: userRepoData.data.node_id,
            url: userRepoData.data.url,
            reposUrl: userRepoData.data.repos_url,
            avatarUrl: userRepoData.data.avatar_url,
            createdAt: userRepoData.data.created_at,
            updatedAt: userRepoData.data.updated_at,
            type: userRepoData.data.type
        })
        for (const org of response.data) {
            const details = await this.octokit.rest.orgs.get({
                org: org.login
            })
            organizations.push({
                name: details.data.login,
                id: details.data.id,
                nodeId: details.data.node_id,
                url: details.data.url,
                reposUrl: details.data.repos_url,
                avatarUrl: details.data.avatar_url,
                createdAt: details.data.created_at,
                updatedAt: details.data.updated_at,
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

    async getOrgRepositories(org: string, user: any): Promise<Repository[]> {
        await this.initOctokit(user)
        const response = await this.octokit.rest.repos.listForOrg({
            org,
            type: 'all'
        })
        const repositories: Repository[] = response.data.map(
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

    async getUserRepositories() {
        const response =
            await this.octokit.rest.repos.listForAuthenticatedUser()
        return response.data
    }
}
