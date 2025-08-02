import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DatabaseService } from 'src/database/database.service'
import { Workspace } from 'src/database/schemas/workspace.schema'
import {
    GitlabApiService,
    GitlabPullRequest,
    GitlabRepositoriesResponse
} from './gitlab-api.service'

@Injectable()
export class GitlabService {
    constructor(
        private readonly dataService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly gitlabApiService: GitlabApiService
    ) {}

    async getAllRepositories(user: any) {
        const userData = await this.dataService.users.findOne(
            { _id: user.sub },
            'accessToken'
        )
        if (!userData?.accessToken) {
            throw new BadRequestException('Access token is required')
        }

        try {
            const data = await this.gitlabApiService.getAllRepositories(
                userData.accessToken
            )
            return data.repositories
        } catch (error) {
            console.error('Error in GitlabService.getAllRepositories:', error)
        }
    }

    async getUserProfile(accessToken: string): Promise<any> {
        if (!accessToken) {
            throw new BadRequestException('Access token is required')
        }

        try {
            return await this.gitlabApiService.getUserProfile(accessToken)
        } catch (error) {
            console.error('Error in GitlabService.getUserProfile:', error)
            throw error
        }
    }

    async getAllGroups(user: any) {
        const userData = await this.dataService.users.findOne(
            { _id: user.sub },
            'accessToken'
        )

        if (!userData?.accessToken) {
            throw new BadRequestException('Access token is required')
        }

        try {
            const data = await this.gitlabApiService.getAllGroups(
                userData?.accessToken
            )

            // Create organizations array similar to GitHub pattern
            const organizations: Workspace[] = []

            // Iterate through each group and save if it doesn't exist
            for (const group of data.groups) {
                // Check if group already exists
                const existingGroup = await this.dataService.workspaces.findOne(
                    {
                        slug: group.slug,
                        provider: 'gitlab',
                        ownerId: user.sub
                    }
                )

                if (!existingGroup) {
                    await this.dataService.workspaces.create({
                        id: group.id,
                        name: group.name,
                        nodeId: group.id,
                        slug: group.slug,
                        url: group.webUrl,
                        reposUrl: group.projectsUrl,
                        avatarUrl: group.avatarUrl || 'null',
                        type: group.type,
                        provider: 'gitlab',
                        ownerId: user.sub,
                        isPrivate: group.isPrivate,
                        createdOn: group.createdAt
                    })
                }

                // Add to organizations array in the format expected by frontend
                organizations.push({
                    id: group.id,
                    name: group.name,
                    nodeId: group.id,
                    slug: group.slug,
                    url: group.webUrl,
                    reposUrl: group.projectsUrl,
                    avatarUrl: group.avatarUrl || null,
                    type: group.type,
                    provider: 'gitlab'
                })
            }

            return organizations
        } catch (error) {
            console.error('Error in GitlabService.getAllGroups:', error)
            throw error
        }
    }

    async getGroupRepositories(
        groupId: string,
        user: any
    ): Promise<GitlabRepositoriesResponse | undefined> {
        const userData = await this.dataService.users.findOne(
            { _id: user.sub },
            'accessToken'
        )
        if (!userData?.accessToken) {
            throw new BadRequestException('Access token is required')
        }

        if (!groupId) {
            throw new BadRequestException('Group ID is required')
        }

        try {
            return await this.gitlabApiService.getGroupRepositories(
                userData.accessToken,
                groupId
            )
        } catch (error) {
            console.error(
                `Error in GitlabService.getGroupRepositories for ${groupId}:`,
                error
            )
            throw error
        }
    }

    async getUserRepositories(
        userId: string,
        user: any
    ): Promise<GitlabRepositoriesResponse | undefined> {
        const userData = await this.dataService.users.findOne(
            { _id: user.sub },
            'accessToken'
        )
        if (!userData?.accessToken) {
            throw new BadRequestException('Access token is required')
        }

        if (!userId) {
            throw new BadRequestException('User ID is required')
        }

        try {
            return await this.gitlabApiService.getUserRepositories(
                userData.accessToken,
                userId
            )
        } catch (error) {
            console.error(
                `Error in GitlabService.getUserRepositories for ${userId}:`,
                error
            )
            throw error
        }
    }

    async addWebhook(
        user: any,
        projectId: string,
        webhookUrl?: string,
        events?: string[]
    ): Promise<any> {
        const userData = await this.dataService.users.findOne(
            { _id: user.sub },
            'accessToken'
        )
        if (!userData?.accessToken) {
            throw new BadRequestException('Access token is required')
        }

        if (!projectId) {
            throw new BadRequestException('Project ID is required')
        }

        // Default webhook URL if not provided
        const finalWebhookUrl =
            webhookUrl ||
            `${this.configService.get('BASE_URL') || 'http://localhost:3001'}/v1/gitlab/callback`

        // Default events if not provided
        const finalEvents = events || [
            'push',
            'merge_requests',
            'issues',
            'note',
            'tag_push',
            'wiki_page',
            'deployment',
            'job',
            'pipeline',
            'release'
        ]

        try {
            if (userData?.accessToken) {
                return await this.gitlabApiService.addWebhook(
                    userData?.accessToken,
                    projectId,
                    finalWebhookUrl,
                    finalEvents
                )
            }
        } catch (error) {
            console.error(
                `Error in GitlabService.addWebhook for project ${projectId}:`,
                error
            )
        }
    }

    async handleOAuthCallback(code: string): Promise<any> {
        if (!code) {
            throw new BadRequestException('Authorization code is required')
        }

        try {
            const userData =
                await this.gitlabApiService.exchangeCodeForToken(code)
            return userData
        } catch (error) {
            console.error('Error in GitlabService.handleOAuthCallback:', error)
            throw error
        }
    }

    async getMergeRequests(
        projectId: string,
        user: any,
        state?: string,
        limit?: number
    ): Promise<GitlabPullRequest[] | undefined> {
        const userData = await this.dataService.users.findOne(
            { _id: user.sub },
            'accessToken'
        )

        if (!userData?.accessToken) {
            throw new BadRequestException('Access token is required')
        }

        if (!projectId) {
            throw new BadRequestException('Project ID is required')
        }

        try {
            return await this.gitlabApiService.getMergeRequests(
                userData.accessToken,
                projectId,
                state,
                limit
            )
        } catch (error) {
            console.error(
                `Error in GitlabService.getMergeRequests for project ${projectId}:`,
                error
            )
        }
    }
}
