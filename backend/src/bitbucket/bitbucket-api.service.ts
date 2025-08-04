import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OrgType } from 'src/common/enums/org.enum'
import { HttpService } from 'src/common/http/http.service'
import {
    PullRequestResponse,
    Repository
} from 'src/common/interfaces/repository.interface'
import { Workspace } from 'src/database/schemas/workspace.schema'

@Injectable()
export class BitbucketApiService {
    private readonly baseUrl = 'https://api.bitbucket.org/2.0'
    private readonly oauthBaseUrl = 'https://bitbucket.org/site/oauth2'

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {}

    /**
     * Get authorization headers for Bitbucket API
     */
    private getAuthHeaders(accessToken: string) {
        return {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    }

    /**
     * Get user profile information
     */
    async getUserProfile(accessToken: string): Promise<any> {
        return await this.httpService.get(`${this.baseUrl}/user`, {
            headers: this.getAuthHeaders(accessToken)
        })
    }

    /**
     * Get all workspaces for the authenticated user
     */
    async getAllWorkspaces(accessToken: string): Promise<Workspace[]> {
        let allWorkspaces: Workspace[] = []
        let url = `${this.baseUrl}/workspaces?pagelen=100`

        const response = await this.httpService.get(url, {
            headers: this.getAuthHeaders(accessToken)
        })
        response.values.map((workspace) =>
            allWorkspaces.push({
                id: workspace.uuid,
                name: workspace.name,
                slug: workspace.slug,
                provider: 'bitbucket',
                url: workspace.links.html.href,
                reposUrl: `${this.baseUrl}/repositories/${workspace.slug}`,
                avatarUrl: workspace.links.avatar?.href,
                type: OrgType.ORGANIZATION,
                nodeId: `BB_${workspace.uuid}`,
                description: workspace.description,
                isPrivate: workspace.is_private,
                createdOn: workspace.created_on
            })
        )
        return allWorkspaces
    }

    /**
     * Get single workspace by slug
     * @param slug - The slug of the workspace to fetch
     * @returns Workspace object or null if not found
     */
    async getSingleWorkspace(
        accessToken: string,
        slug: string
    ): Promise<Workspace> {
        let url = `${this.baseUrl}/workspaces/${slug}`
        const workspace = await this.httpService.get(url, {
            headers: this.getAuthHeaders(accessToken)
        })
        return {
            id: workspace.uuid,
            name: workspace.name,
            slug: workspace.slug,
            provider: 'bitbucket',
            url: workspace.links.html.href,
            reposUrl: `${this.baseUrl}/repositories/${workspace.slug}`,
            avatarUrl: workspace.links.avatar?.href,
            type:
                workspace.type == 'user' ? OrgType.USER : OrgType.ORGANIZATION,
            nodeId: `BB_${workspace.uuid}`,
            description: workspace.description,
            isPrivate: workspace.is_private,
            createdOn: workspace.created_on
        }
    }

    /**
     * Get repositories for a specific workspace
     */
    async getWorkspaceRepositories(
        accessToken: string,
        workspace: string
    ): Promise<Repository[]> {
        let allRepositories: Repository[] = []
        let url = `${this.baseUrl}/repositories/${workspace}?pagelen=100`

        const response = await this.httpService.get(url, {
            headers: this.getAuthHeaders(accessToken)
        })

        const repositories = response.values.map((repo) =>
            this.mapRepositoryResponse(repo)
        )
        allRepositories = allRepositories.concat(repositories)

        return allRepositories
    }

    /**
     * Add webhook to a specific repository
     */
    async addWebhook(
        accessToken: string,
        workspace: string,
        repository: string,
        webhookUrl: string,
        events: string[]
    ): Promise<any> {
        const webhookPayload = {
            description:
                'PullSight AI Webhook - Automated webhook for pull request and issue analysis',
            url: webhookUrl,
            active: true,
            events: events
        }

        const response = await this.httpService.post(
            `${this.baseUrl}/repositories/${workspace}/${repository}/hooks`,
            webhookPayload,
            {
                headers: this.getAuthHeaders(accessToken)
            }
        )

        return {
            message: 'Webhook successfully added!',
            repository: {
                workspace: workspace,
                name: repository,
                fullName: `${workspace}/${repository}`
            },
            webhook: {
                id: response.uuid,
                url: response.url,
                description: response.description,
                active: response.active,
                events: response.events,
                createdAt: response.created_at,
                links: response.links
            }
        }
    }

    /**
     * Map Bitbucket API repository response to our interface
     */
    private mapRepositoryResponse(repo: any): Repository {
        return {
            id: repo.uuid,
            name: repo.name,
            fullName: repo.full_name,
            createdAt: repo.created_on,
            updatedAt: repo.updated_on,
            author: {
                name: repo.owner?.username,
                avatarUrl: repo.owner?.links?.avatar?.href
            },
            private: repo.is_private,
            openIssues: repo.open_issues_count || 0
        }
    }

    /**
     * Get pull requests for a specific repository
     */
    async getPullRequests(
        accessToken: string,
        workspace: string,
        repository: string,
        state?: string,
        limit?: number
    ): Promise<PullRequestResponse[]> {
        let allPullRequests: PullRequestResponse[] = []
        const pageLimit = limit ? Math.min(limit, 100) : 50
        let nextUrl = `/repositories/${workspace}/${repository}/pullrequests?pagelen=${pageLimit}`

        // Add state filter if provided
        if (state) {
            nextUrl += `&state=${state.toUpperCase()}`
        }

        const url = `${this.baseUrl}${nextUrl}`
        const response = await this.httpService.get(url, {
            headers: this.getAuthHeaders(accessToken)
        })

        response.values.map((pr) => {
            allPullRequests.push({
                id: pr.id,
                nodeId: `BB_${pr.id}`,
                prNumber: pr.id,
                title: pr.title,
                status: pr.state.toLowerCase(),
                author: {
                    username: pr.author.nickname,
                    avatarUrl: pr.author.links?.avatar?.href
                },
                createdAt: pr.created_on,
                updatedAt: pr.updated_on,
                closedAt:
                    pr.state === 'DECLINED' || pr.state === 'SUPERSEDED'
                        ? pr.updated_on
                        : null,
                mergedAt: pr.state === 'MERGED' ? pr.updated_on : null,
                url: pr.links.html.href
            })
        })
        return allPullRequests
    }

    async refreshAccessToken(refreshToken: string): Promise<{
        access_token: string
        refresh_token?: string
        expires_in: number
    } | null> {
        const bitbucketTokenUrl =
            this.configService.get('BITBUCKET_TOKEN_URL') ||
            'https://bitbucket.org/site/oauth2/access_token'
        const clientId = this.configService.get('BITBUCKET_CLIENT_ID')
        const clientSecret = this.configService.get('BITBUCKET_CLIENT_SECRET')
        const response = await this.httpService.post(
            bitbucketTokenUrl,
            {
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            },
            {
                auth: {
                    username: clientId,
                    password: clientSecret
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )
        return response
    }
}
