import { HttpService } from '@nestjs/axios'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

export interface GitlabRepository {
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

export interface GitlabRepositoriesResponse {
    repositories: GitlabRepository[]
}

export interface GitlabPullRequest {
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

export interface GitlabPullRequestsResponse {
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
    pullRequests: GitlabPullRequest[]
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
export class GitlabApiService {
    private readonly baseUrl = 'https://gitlab.com/api/v4'
    private readonly oauthBaseUrl = 'https://gitlab.com/oauth'

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {}

    /**
     * Get authorization headers for GitLab API
     */
    private getAuthHeaders(accessToken: string) {
        return {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    }

    /**
     * Generic method to make API calls to GitLab
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
            console.error('GitLab API Error:', {
                endpoint,
                error: error.response?.data || error.message,
                status: error.response?.status
            })

            throw new HttpException(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'GitLab API request failed',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    /**
     * Get all repositories for the authenticated user
     */
    async getAllRepositories(
        accessToken: string
    ): Promise<GitlabRepositoriesResponse> {
        try {
            const projects = await this.makeApiCall<any[]>(
                `/projects?membership=true&per_page=100&order_by=updated_at&sort=desc`,
                accessToken
            )

            const repositories: GitlabRepository[] = projects.map(
                (project: any) => ({
                    id: project.id.toString(),
                    name: project.name,
                    fullName: project.path_with_namespace,
                    createdOn: project.created_at,
                    updatedOn: project.last_activity_at || project.updated_at,
                    author: {
                        username:
                            project.owner?.username ||
                            project.namespace?.name ||
                            'unknown',
                        displayName:
                            project.owner?.name ||
                            project.namespace?.full_name ||
                            'Unknown',
                        type: project.namespace?.kind || 'user'
                    }
                })
            )

            return {
                repositories
            }
        } catch (error) {
            console.error(
                'Error in GitlabApiService.getAllRepositories:',
                error
            )
            throw error
        }
    }

    /**
     * Get a specific repository
     */
    async getRepository(accessToken: string, projectId: string): Promise<any> {
        try {
            return await this.makeApiCall(
                `/projects/${encodeURIComponent(projectId)}`,
                accessToken
            )
        } catch (error) {
            console.error(
                `Error in GitlabApiService.getRepository for ${projectId}:`,
                error
            )
            throw error
        }
    }

    /**
     * Get user profile information
     */
    async getUserProfile(accessToken: string): Promise<any> {
        try {
            return await this.makeApiCall('/user', accessToken)
        } catch (error) {
            console.error('Error in GitlabApiService.getUserProfile:', error)
            throw error
        }
    }

    /**
     * Get all groups (equivalent to workspaces in Bitbucket)
     */
    async getAllGroups(accessToken: string): Promise<any> {
        try {
            const groups = await this.makeApiCall<any[]>(
                `/groups?per_page=100&order_by=name&sort=asc`,
                accessToken
            )

            const transformedGroups = groups.map((group: any) => ({
                id: group.id.toString(),
                name: group.name,
                slug: group.path,
                fullName: group.full_name,
                description: group.description || '',
                visibility: group.visibility,
                avatarUrl: group.avatar_url || null,
                webUrl: group.web_url,
                projectsUrl: `${this.baseUrl}/groups/${group.id}/projects`,
                createdAt: group.created_at,
                isPrivate: group.visibility === 'private',
                type: 'group'
            }))

            return {
                groups: transformedGroups
            }
        } catch (error) {
            console.error('Error in GitlabApiService.getAllGroups:', error)
            throw error
        }
    }

    /**
     * Get repositories for a specific group
     */
    async getGroupRepositories(
        accessToken: string,
        groupId: string
    ): Promise<GitlabRepositoriesResponse> {
        try {
            const projects = await this.makeApiCall<any[]>(
                `/groups/${encodeURIComponent(groupId)}/projects?per_page=100&order_by=updated_at&sort=desc`,
                accessToken
            )

            const repositories: GitlabRepository[] = projects.map(
                (project: any) => ({
                    id: project.id.toString(),
                    name: project.name,
                    fullName: project.path_with_namespace,
                    createdOn: project.created_at,
                    updatedOn: project.last_activity_at || project.updated_at,
                    author: {
                        username:
                            project.owner?.username ||
                            project.namespace?.name ||
                            'unknown',
                        displayName:
                            project.owner?.name ||
                            project.namespace?.full_name ||
                            'Unknown',
                        type: project.namespace?.kind || 'group'
                    }
                })
            )

            return {
                repositories
            }
        } catch (error) {
            console.error(
                `Error in GitlabApiService.getGroupRepositories for ${groupId}:`,
                error
            )
            throw error
        }
    }

    /**
     * Add webhook to a repository
     */
    async addWebhook(
        accessToken: string,
        projectId: string,
        webhookUrl: string,
        events: string[]
    ): Promise<any> {
        try {
            // Map events to GitLab webhook events
            const gitlabEvents = {
                push_events:
                    events.includes('push') || events.includes('repo:push'),
                merge_requests_events:
                    events.includes('merge_requests') ||
                    events.includes('pullrequest:created') ||
                    events.includes('pullrequest:updated'),
                issues_events:
                    events.includes('issues') ||
                    events.includes('issue:created') ||
                    events.includes('issue:updated'),
                note_events:
                    events.includes('note') ||
                    events.includes('issue:comment_created'),
                tag_push_events: events.includes('tag_push'),
                wiki_page_events: events.includes('wiki_page'),
                deployment_events: events.includes('deployment'),
                job_events: events.includes('job'),
                pipeline_events: events.includes('pipeline'),
                release_events: events.includes('release')
            }

            const webhookData = {
                url: webhookUrl,
                ...gitlabEvents,
                enable_ssl_verification: true
            }

            return await this.makeApiCall(
                `/projects/${encodeURIComponent(projectId)}/hooks`,
                accessToken,
                'POST',
                webhookData
            )
        } catch (error) {
            console.error(
                `Error in GitlabApiService.addWebhook for ${projectId}:`,
                error
            )
            throw error
        }
    }

    /**
     * Exchange authorization code for access token
     */
    async exchangeCodeForToken(code: string): Promise<any> {
        try {
            const clientId = this.configService.get('GITLAB_CLIENT_ID')
            const clientSecret = this.configService.get('GITLAB_CLIENT_SECRET')
            const redirectUri = this.configService.get('GITLAB_REDIRECT_URI')

            if (!clientId || !clientSecret || !redirectUri) {
                throw new HttpException(
                    'GitLab OAuth configuration is missing',
                    HttpStatus.INTERNAL_SERVER_ERROR
                )
            }

            const tokenData = {
                client_id: clientId,
                client_secret: clientSecret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri
            }

            const response = await firstValueFrom(
                this.httpService.post(`${this.oauthBaseUrl}/token`, tokenData, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Accept: 'application/json'
                    }
                })
            )

            if (response.data.access_token) {
                // Get user profile with the access token
                const userProfile = await this.getUserProfile(
                    response.data.access_token
                )

                return {
                    accessToken: response.data.access_token,
                    refreshToken: response.data.refresh_token,
                    tokenType: response.data.token_type,
                    expiresIn: response.data.expires_in,
                    scope: response.data.scope,
                    user: userProfile
                }
            } else {
                throw new HttpException(
                    'Failed to exchange code for access token',
                    HttpStatus.BAD_REQUEST
                )
            }
        } catch (error) {
            console.error(
                'Error in GitlabApiService.exchangeCodeForToken:',
                error
            )
            throw error
        }
    }

    /**
     * Get merge requests (pull requests) for a repository
     */
    async getMergeRequests(
        accessToken: string,
        projectId: string,
        state?: string,
        limit?: number
    ): Promise<GitlabPullRequest[]> {
        try {
            const params = new URLSearchParams()
            if (state) {
                // Map states: opened, closed, merged, all
                params.append('state', state.toLowerCase())
            }
            if (limit) {
                params.append('per_page', limit.toString())
            }
            params.append('order_by', 'updated_at')
            params.append('sort', 'desc')

            const mergeRequests = await this.makeApiCall<any[]>(
                `/projects/${encodeURIComponent(projectId)}/merge_requests?${params.toString()}`,
                accessToken
            )

            return mergeRequests.map((mr: any) => ({
                id: mr.id,
                nodeId: mr.id.toString(),
                prNumber: mr.iid,
                title: mr.title,
                status: mr.state,
                user: {
                    username: mr.author?.username || 'unknown',
                    avatarUrl: mr.author?.avatar_url || null
                },
                createdAt: mr.created_at,
                updatedAt: mr.updated_at,
                closedAt: mr.closed_at,
                mergedAt: mr.merged_at,
                url: mr.web_url
            }))
        } catch (error) {
            console.error(
                `Error in GitlabApiService.getMergeRequests for ${projectId}:`,
                error
            )
            throw error
        }
    }
}
