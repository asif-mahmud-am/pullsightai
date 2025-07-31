import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DatabaseService } from 'src/database/database.service'
import {
    BitbucketApiService,
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
            return await this.bitbucketApiService.getAllWorkspaces(
                userData?.accessToken
            )
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
}
