import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BitbucketEventsService } from 'src/bitbucket/bitbucket-events.service'
import { StructuredPRData } from 'src/common/interfaces/pr.interface'
import { DatabaseService } from 'src/database/database.service'
import { Workspace } from 'src/database/schemas/workspace.schema'
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
        private readonly bitbucketApiService: BitbucketApiService,
        private readonly httpService: HttpService,
        private readonly bitbucketEventsService: BitbucketEventsService
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
            'accessToken _id workspaces currentWorkspace'
        )

        if (!userData?.accessToken) {
            throw new BadRequestException('Access token is required')
        }

        try {
            const data = await this.bitbucketApiService.getAllWorkspaces(
                userData?.accessToken
            )
            console.log('data', data)
            // Create organizations array similar to GitHub pattern
            const organizations: Workspace[] = []
            let isFirstWorkspace = true

            // Iterate through each workspace and save if it doesn't exist
            for (const workspace of data.workspaces) {
                // Check if workspace already exists
                const existingWorkspace =
                    await this.dataService.workspaces.findOne({
                        slug: workspace.slug,
                        provider: 'bitbucket',
                        ownerId: user.sub
                    })

                let workspaceToAdd: any = null

                if (!existingWorkspace) {
                    // Create new workspace
                    const newWorkspace =
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
                    workspaceToAdd = newWorkspace
                } else {
                    workspaceToAdd = existingWorkspace
                }

                // Set currentWorkspace to the first workspace if not already set
                if (isFirstWorkspace && !userData.currentWorkspace) {
                    await this.dataService.users.updateOne(
                        { _id: user.sub },
                        {
                            $set: {
                                currentWorkspace: workspaceToAdd._id
                            }
                        }
                    )
                }

                // Add workspace to user's workspaces if not already included
                if (userData && userData.workspaces) {
                    if (!userData.workspaces.includes(workspaceToAdd._id)) {
                        await this.dataService.users.updateOne(
                            { _id: user.sub },
                            {
                                $addToSet: {
                                    workspaces: workspaceToAdd._id
                                }
                            }
                        )
                    }
                } else {
                    // If user has no workspaces array, initialize it
                    await this.dataService.users.updateOne(
                        { _id: user.sub },
                        {
                            $addToSet: {
                                workspaces: workspaceToAdd._id
                            }
                        }
                    )
                }

                // Add to organizations array in the format expected by frontend
                organizations.push({
                    id: workspace.slug,
                    name: workspace.name,
                    nodeId: workspace.uuid || 'null',
                    slug: workspace.slug,
                    url: workspace.links.html,
                    reposUrl: workspace.links.repositories,
                    avatarUrl: workspace.links.avatar || null,
                    type: workspace.type,
                    provider: 'bitbucket'
                })

                // Mark that we've processed the first workspace
                isFirstWorkspace = false
            }

            return organizations
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

    async processBitbucketEvent(event: any, payload: any) {
        let pullRequestFormattedData: StructuredPRData | boolean
        switch (event) {
            case 'pullrequest:created':
            case 'pullrequest:updated':
                pullRequestFormattedData =
                    await this.bitbucketEventsService.handleBitbucketPullRequest(
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
