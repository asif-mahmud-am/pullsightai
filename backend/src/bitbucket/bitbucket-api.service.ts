import { HttpService } from '@nestjs/axios'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

export interface BitbucketRepository {
    name: string
    fullName: string
    createdOn: string
    updatedOn: string
    id: string
    author: {
        username: string
        displayName: string
        type: string
    }
}

export interface BitbucketRepositoriesResponse {
    repositories: BitbucketRepository[]
}

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
     * Generic method to make API calls to Bitbucket
     */
    private async makeApiCall<T>(
        endpoint: string,
        accessToken: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        data?: any
    ): Promise<T> {
        try {
            const url = `${this.baseUrl}${endpoint}`
            const headers = this.getAuthHeaders(accessToken)

            const response = await firstValueFrom(
                this.httpService.request({
                    method,
                    url,
                    headers,
                    data
                })
            )

            return response.data
        } catch (error) {
            console.error(
                `❌ Bitbucket API Error:`,
                error.response?.data || error.message
            )

            if (error.response?.status === 401) {
                throw new HttpException(
                    'Invalid or expired access token',
                    HttpStatus.UNAUTHORIZED
                )
            }

            if (error.response?.status === 403) {
                throw new HttpException(
                    'Insufficient permissions',
                    HttpStatus.FORBIDDEN
                )
            }

            if (error.response?.status === 404) {
                throw new HttpException(
                    'Resource not found',
                    HttpStatus.NOT_FOUND
                )
            }

            throw new HttpException(
                error.response?.data?.error?.message ||
                    'Bitbucket API request failed',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    /**
     * Get all repositories for the authenticated user with pagination
     */
    async getAllRepositories(
        accessToken: string
    ): Promise<BitbucketRepositoriesResponse> {
        try {
            let allRepositories: BitbucketRepository[] = []
            let nextUrl = '/repositories?role=member&pagelen=100'

            // Fetch all pages of repositories
            while (nextUrl) {
                const response = await this.makeApiCall<any>(
                    nextUrl,
                    accessToken
                )

                const repositories = response.values.map((repo) =>
                    this.mapRepositoryResponse(repo)
                )
                allRepositories = allRepositories.concat(repositories)

                // Check if there's a next page (remove base URL if present)
                nextUrl = response.next
                    ? response.next.replace(this.baseUrl, '')
                    : null
            }

            return {
                repositories: allRepositories
            }
        } catch (error) {
            console.error('❌ Error fetching repositories:', error)
            throw error
        }
    }

    /**
     * Get a specific repository by full name
     */
    async getRepository(
        accessToken: string,
        fullName: string
    ): Promise<BitbucketRepository> {
        try {
            const response = await this.makeApiCall<any>(
                `/repositories/${fullName}`,
                accessToken
            )
            return this.mapRepositoryResponse(response)
        } catch (error) {
            console.error(`❌ Error fetching repository ${fullName}:`, error)
            throw error
        }
    }

    /**
     * Get user profile information
     */
    async getUserProfile(accessToken: string): Promise<any> {
        try {
            return await this.makeApiCall<any>('/user', accessToken)
        } catch (error) {
            console.error('❌ Error fetching user profile:', error)
            throw error
        }
    }

    /**
     * Get all workspaces for the authenticated user
     */
    async getAllWorkspaces(accessToken: string): Promise<any> {
        try {
            // First get user profile to add as the personal workspace
            const userProfile = await this.getUserProfile(accessToken)

            let allWorkspaces = []
            let nextUrl = '/workspaces?pagelen=100'

            while (nextUrl) {
                const response = await this.makeApiCall<any>(
                    nextUrl,
                    accessToken
                )
                const workspaces = response.values.map((workspace) => ({
                    name: workspace.name,
                    slug: workspace.slug,
                    displayName: workspace.display_name,
                    type: workspace.type,
                    isPrivate: workspace.is_private,
                    createdOn: workspace.created_on,
                    updatedOn: workspace.updated_on,
                    uuid: workspace.uuid,
                    links: {
                        html: workspace.links.html.href,
                        repositories: `${this.baseUrl}/repositories/${workspace.slug}`,
                        projects: workspace.links.projects?.href,
                        avatar: workspace.links.avatar?.href
                    }
                }))

                allWorkspaces = allWorkspaces.concat(workspaces)
                nextUrl = response.next
                    ? response.next.replace(this.baseUrl, '')
                    : null
            }

            // Add user profile as the first workspace (personal workspace)
            const personalWorkspace = {
                name: userProfile.display_name || userProfile.username,
                slug: userProfile.username,
                displayName: userProfile.display_name || userProfile.username,
                type: 'user',
                isPrivate: false,
                createdOn: userProfile.created_on,
                updatedOn: userProfile.created_on,
                uuid: userProfile.uuid,
                links: {
                    html:
                        userProfile.links?.html?.href ||
                        `https://bitbucket.org/${userProfile.username}`,
                    repositories: `${this.baseUrl}/repositories/${userProfile.username}`,
                    avatar: userProfile.links?.avatar?.href
                }
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
    ): Promise<BitbucketRepositoriesResponse> {
        try {
            let allRepositories: BitbucketRepository[] = []
            let nextUrl = `/repositories/${workspace}?pagelen=100`

            while (nextUrl) {
                console.log(
                    `🔄 Fetching repositories for workspace ${workspace} from: ${this.baseUrl}${nextUrl}`
                )

                const response = await this.makeApiCall<any>(
                    nextUrl,
                    accessToken
                )

                const repositories = response.values.map((repo) =>
                    this.mapRepositoryResponse(repo)
                )
                allRepositories = allRepositories.concat(repositories)

                nextUrl = response.next
                    ? response.next.replace(this.baseUrl, '')
                    : null
            }

            console.log(
                `✅ Found ${allRepositories.length} repositories in workspace ${workspace}`
            )

            return {
                repositories: allRepositories
            }
        } catch (error) {
            console.error(
                `❌ Error fetching repositories for workspace ${workspace}:`,
                error
            )
            throw error
        }
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
        try {
            console.log(`🔄 Adding webhook to ${workspace}/${repository}...`)

            const webhookPayload = {
                description:
                    'PullSight AI Webhook - Automated webhook for pull request and issue analysis',
                url: webhookUrl,
                active: true,
                events: events
            }

            const response = await this.makeApiCall<any>(
                `/repositories/${workspace}/${repository}/hooks`,
                accessToken,
                'POST',
                webhookPayload
            )

            console.log(
                `✅ Successfully created webhook for ${workspace}/${repository}`
            )
            console.log(`🔗 Webhook URL: ${response.url}`)
            console.log(`📋 Webhook ID: ${response.uuid}`)

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
        } catch (error) {
            console.error(
                `❌ Error adding webhook to ${workspace}/${repository}:`,
                error
            )

            if (error.response?.status === 403) {
                throw new HttpException(
                    'You do not have permission to add webhooks to this repository. Make sure you have admin access.',
                    HttpStatus.FORBIDDEN
                )
            } else if (error.response?.status === 404) {
                throw new HttpException(
                    `Repository ${workspace}/${repository} not found or you don't have access to it.`,
                    HttpStatus.NOT_FOUND
                )
            }

            throw error
        }
    }

    /**
     * Map Bitbucket API repository response to our interface
     */
    private mapRepositoryResponse(repo: any): BitbucketRepository {
        return {
            name: repo.name,
            fullName: repo.full_name,
            createdOn: repo.created_on,
            updatedOn: repo.updated_on,
            id: repo.uuid,
            author: {
                username: repo.owner?.username,
                displayName: repo.owner?.display_name,
                type: repo.owner?.type
            }
        }
    }

    /**
     * Exchange authorization code for access token (OAuth flow)
     */
    async exchangeCodeForToken(code: string): Promise<any> {
        try {
            const redirectUri = `${this.configService.get<string>('BASE_URL')}/v1/auth/bitbucket/callback`
            console.log('🔄 Token exchange redirect_uri:', redirectUri)

            // Exchange code for access token
            const tokenResponse = await firstValueFrom(
                this.httpService.post(
                    `${this.oauthBaseUrl}/access_token`,
                    `grant_type=authorization_code&code=${code}&client_id=${this.configService.get<string>('BITBUCKET_CLIENT_ID')}&client_secret=${this.configService.get<string>('BITBUCKET_CLIENT_SECRET')}&redirect_uri=${encodeURIComponent(redirectUri)}`,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            Accept: 'application/json'
                        }
                    }
                )
            )

            const tokens = tokenResponse.data

            // Get user profile using the new token
            const userResponse = await firstValueFrom(
                this.httpService.get(`${this.baseUrl}/user`, {
                    headers: {
                        Authorization: `Bearer ${tokens.access_token}`,
                        Accept: 'application/json'
                    }
                })
            )

            const result = {
                user: userResponse.data,
                tokens: tokens
            }

            console.log(
                '✅ Bitbucket OAuth Success:',
                JSON.stringify(result, null, 2)
            )

            return result
        } catch (error) {
            console.log(
                '❌ Bitbucket OAuth error:',
                error.response?.data || error.message
            )
            throw new HttpException(
                'OAuth token exchange failed',
                HttpStatus.BAD_REQUEST
            )
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
        try {
            let allPullRequests: BitbucketPullRequest[] = []
            const pageLimit = limit ? Math.min(limit, 100) : 50
            let nextUrl = `/repositories/${workspace}/${repository}/pullrequests?pagelen=${pageLimit}`

            // Add state filter if provided
            if (state) {
                nextUrl += `&state=${state.toUpperCase()}`
            }

            // Fetch all pages of pull requests (or up to the limit)
            while (nextUrl && (!limit || allPullRequests.length < limit)) {
                const response = await this.makeApiCall<any>(
                    nextUrl,
                    accessToken
                )

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

                allPullRequests = allPullRequests.concat(pullRequests)

                // Check if we've reached the limit or if there's no next page
                if (limit && allPullRequests.length >= limit) {
                    allPullRequests = allPullRequests.slice(0, limit)
                    break
                }

                nextUrl = response.next
                    ? response.next.replace(this.baseUrl, '')
                    : null
            }

            return allPullRequests
        } catch (error) {
            console.error(
                `❌ Error fetching pull requests for ${workspace}/${repository}:`,
                error
            )

            if (error.response?.status === 404) {
                throw new HttpException(
                    `Repository ${workspace}/${repository} not found or you don't have access to it.`,
                    HttpStatus.NOT_FOUND
                )
            }

            throw new HttpException(
                error.response?.data?.error?.message ||
                    'Failed to fetch pull requests',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
