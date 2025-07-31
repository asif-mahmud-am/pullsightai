import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DatabaseService } from 'src/database/database.service'
import {
    BitbucketApiService,
    BitbucketPullRequest,
    BitbucketRepositoriesResponse
} from './bitbucket-api.service'

@Injectable()
export class BitbucketService {
    constructor(
        private readonly dataService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly bitbucketApiService: BitbucketApiService
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
            const data = await this.bitbucketApiService.getAllRepositories(
                userData.accessToken
            )
            return data.repositories
        } catch (error) {
            console.error(
                'Error in BitbucketService.getAllRepositories:',
                error
            )
        }
    }

    async getUserProfile(accessToken: string): Promise<any> {
        if (!accessToken) {
            throw new BadRequestException('Access token is required')
        }

        try {
            return await this.bitbucketApiService.getUserProfile(accessToken)
        } catch (error) {
            console.error('Error in BitbucketService.getUserProfile:', error)
            throw error
        }
    }

    async getAllWorkspaces(user: any) {
        const userData = await this.dataService.users.findOne(
            { _id: user.sub },
            'accessToken'
        )

        if (!userData?.accessToken) {
            throw new BadRequestException('Access token is required')
        }

        try {
            const data = await this.bitbucketApiService.getAllWorkspaces(
                userData?.accessToken
            )

            // Iterate through each workspace and save if it doesn't exist
            for (const workspace of data.workspaces) {
                // Check if workspace already exists
                const existingWorkspace =
                    await this.dataService.workspaces.findOne({
                        slug: workspace.slug,
                        provider: 'bitbucket',
                        ownerId: user.sub
                    })

                if (!existingWorkspace) {
                    await this.dataService.workspaces.create({
                        id: workspace.slug, // Using slug as ID since Bitbucket doesn't have numeric ID
                        name: workspace.name,
                        nodeId: workspace.uuid || 'null', // Bitbucket UUID might be null
                        slug: workspace.slug,
                        url: workspace.links.html,
                        reposUrl: workspace.links.repositories,
                        avatarUrl: workspace.links.avatar || 'null', // Bitbucket might not have avatar
                        type: workspace.type,
                        provider: 'bitbucket',
                        ownerId: user.sub,
                        isPrivate: workspace.isPrivate,
                        createdOn: workspace.createdOn
                    })
                }
            }

            return data.workspaces
        } catch (error) {
            console.error('Error in BitbucketService.getAllWorkspaces:', error)
            throw error
        }
    }

    async getWorkspaceRepositories(
        workspace: string,
        user: any
    ): Promise<BitbucketRepositoriesResponse | undefined> {
        const userData = await this.dataService.users.findOne(
            { _id: user.sub },
            'accessToken'
        )
        if (userData?.accessToken) {
            throw new BadRequestException('Access token is required')
        }

        if (!workspace) {
            throw new BadRequestException('Workspace is required')
        }

        try {
            if (userData?.accessToken) {
                return await this.bitbucketApiService.getWorkspaceRepositories(
                    userData.accessToken,
                    workspace
                )
            }
        } catch (error) {
            console.error(
                `Error in BitbucketService.getWorkspaceRepositories for ${workspace}:`,
                error
            )
            throw error
        }
    }

    async addWebhook(
        accessToken: string,
        repository: string,
        workspace: string,
        webhookUrl?: string,
        events?: string[]
    ): Promise<any> {
        if (!accessToken) {
            throw new BadRequestException('Access token is required')
        }

        if (!repository || !workspace) {
            throw new BadRequestException(
                'Repository and workspace are required'
            )
        }

        // Default webhook URL if not provided
        const finalWebhookUrl =
            webhookUrl ||
            `${this.configService.get('BASE_URL') || 'http://localhost:3001'}/api/webhooks/bitbucket`

        // Default events if not provided
        const finalEvents = events || [
            'repo:push',
            'pullrequest:created',
            'pullrequest:updated',
            'pullrequest:approved',
            'pullrequest:unapproved',
            'pullrequest:fulfilled',
            'pullrequest:rejected',
            'issue:created',
            'issue:updated',
            'issue:comment_created'
        ]

        try {
            return await this.bitbucketApiService.addWebhook(
                accessToken,
                workspace,
                repository,
                finalWebhookUrl,
                finalEvents
            )
        } catch (error) {
            console.error(
                `Error in BitbucketService.addWebhook for ${workspace}/${repository}:`,
                error
            )
            throw error
        }
    }

    async handleOAuthCallback(code: string): Promise<any> {
        if (!code) {
            throw new BadRequestException('Authorization code is required')
        }

        try {
            const userData =
                await this.bitbucketApiService.exchangeCodeForToken(code)
            return userData
        } catch (error) {
            console.error(
                'Error in BitbucketService.handleOAuthCallback:',
                error
            )
            throw error
        }
    }

    async getPullRequests(
        workspace: string,
        repository: string,
        user: any,
        state?: string,
        limit?: number
    ): Promise<BitbucketPullRequest[] | undefined> {
        const userData = await this.dataService.users.findOne(
            { _id: user.sub },
            'accessToken'
        )

        if (!userData?.accessToken) {
            throw new BadRequestException('Access token is required')
        }

        if (!workspace || !repository) {
            throw new BadRequestException(
                'Workspace and repository are required'
            )
        }

        try {
            return await this.bitbucketApiService.getPullRequests(
                userData.accessToken,
                workspace,
                repository,
                state,
                limit
            )
        } catch (error) {
            console.error(
                `Error in BitbucketService.getPullRequests for ${workspace}/${repository}:`,
                error
            )
        }
    }
}
