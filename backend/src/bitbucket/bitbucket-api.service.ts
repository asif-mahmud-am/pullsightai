import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from 'src/common/http/http.service'
import { Repository } from 'src/common/interfaces/repository.interface'
import { Workspace } from 'src/database/schemas/workspace.schema'

export interface BitbucketPullRequest {
    id: number
    nodeId: string
    prNumber: number
    title: string
    status: string
    user: {
        username: string
        avatarUrl?: string
    }
    createdAt: string
    updatedAt: string
    closedAt: string | null
    mergedAt: string | null
    url: string
}

export interface BitbucketPullRequestsResponse {
    message: string
    repository: {
        workspace: string
        name: string
        fullName: string
    }
    filters: {
        state: string
        limit: string
    }
    totalCount: number
    pullRequests: BitbucketPullRequest[]
    summary: {
        total: number
        byState: Record<string, number>
        withReviewers: number
        withComments: number
        withTasks: number
        authors: number
        averageComments: number
        averageTasks: number
    }
}

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
    async getAllWorkspaces(accessToken: string): Promise<any> {
        try {
            // First get user profile to add as the personal workspace
            const userProfile = await this.getUserProfile(accessToken)

            let allWorkspaces = []
            let url = `${this.baseUrl}/workspaces?pagelen=100`

            const response = await this.httpService.get(url, {
                headers: this.getAuthHeaders(accessToken)
            })
            const workspaces = response.values.map(
                (workspace) =>
                    ({
                        id: workspace.uuid,
                        name: workspace.name,
                        slug: workspace.slug,
                        provider: 'bitbucket',
                        url: workspace.links.html.href,
                        reposUrl: `${this.baseUrl}/repositories/${workspace.slug}`,
                        avatarUrl: workspace.links.avatar?.href,
                        type: workspace.type,
                        nodeId: `BB_${workspace.uuid}`,
                        description: workspace.description,
                        isPrivate: workspace.is_private,
                        createdOn: workspace.created_on
                    }) as Workspace
            )

            // Add user profile as the first workspace (personal workspace)
            const personalWorkspace: Workspace = {
                id: userProfile.uuid,
                name: userProfile.display_name || userProfile.username,
                slug: userProfile.username,
                type: 'user',
                isPrivate: false,
                createdOn: userProfile.created_on,
                provider: 'bitbucket',
                url: userProfile.links.html.href,
                reposUrl: `${this.baseUrl}/repositories/${userProfile.username}`,
                avatarUrl: userProfile.links.avatar?.href,
                nodeId: `BB_${userProfile.uuid}`,
                description: userProfile.display_name || userProfile.username,
                ownerId: userProfile.uuid
            }

            // Put personal workspace first, then all other workspaces
            const finalWorkspaces = [personalWorkspace, ...allWorkspaces]

            return {
                workspaces: finalWorkspaces
            }
        } catch (error) {
            console.error('❌ Error fetching workspaces:', error)
            throw error
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
    ): Promise<BitbucketPullRequest[]> {
        let allPullRequests: BitbucketPullRequest[] = []
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

        const pullRequests = response.values.map((pr) => ({
            id: pr.id,
            nodeId: `BB_${pr.id}`,
            prNumber: pr.id,
            title: pr.title,
            status: pr.state.toLowerCase(),
            user: {
                username: pr.author.username,
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
        }))
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
