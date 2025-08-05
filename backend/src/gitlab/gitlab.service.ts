import { HttpService } from '@nestjs/axios'
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AddWorkspaceDto } from 'src/common/dto/add-workspace.dto'
import { StructuredPRData } from 'src/common/interfaces/pr.interface'
import {
    PullRequestResponse,
    Repository
} from 'src/common/interfaces/repository.interface'
import { DatabaseService } from 'src/database/database.service'
import { Workspace } from 'src/database/schemas/workspace.schema'
import { GitlabEventsService } from 'src/gitlab/gitlab-events.service'
import { GitlabApiService } from './gitlab-api.service'

@Injectable()
export class GitlabService {
    constructor(
        private readonly dataService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly gitlabApiService: GitlabApiService,
        private readonly httpService: HttpService,
        private readonly gitlabEventsService: GitlabEventsService
    ) {}

    async getAllRepositories(user: any): Promise<Repository[]> {
        const userData = await this.dataService.users
            .findOne({ _id: user.sub }, 'accessToken currentWorkspace')
            .populate('currentWorkspace', 'slug type')
        if (!userData?.accessToken || !userData?.currentWorkspace) {
            throw new BadRequestException(
                'Access token is required or workspace not set'
            )
        }
        return await this.gitlabApiService.getAllRepositories(
            userData.accessToken,
            userData.currentWorkspace['slug'],
            userData.currentWorkspace['type']
        )
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
            'accessToken _id workspaces currentWorkspace'
        )
        if (!userData?.accessToken) {
            throw new BadRequestException('Access token is required')
        }
        return await this.gitlabApiService.getAllGroups(userData?.accessToken)
    }

    async addWorkspace(
        user: any,
        addWorkspaceDto: AddWorkspaceDto
    ): Promise<Workspace> {
        const userData = await this.dataService.users.findOne(
            { _id: user.sub },
            'accessToken _id'
        )

        if (!userData?.accessToken) {
            throw new BadRequestException('Access token is required')
        }

        const workspace = await this.gitlabApiService.getSingleWorkspace(
            userData?.accessToken,
            addWorkspaceDto.slug,
            addWorkspaceDto.type
        )

        let existingWorkspace = await this.dataService.workspaces.findOne({
            id: workspace.id,
            slug: workspace.slug,
            provider: 'bitbucket'
        })

        if (!existingWorkspace) {
            existingWorkspace = await this.dataService.workspaces.create({
                ...workspace,
                ownerId: userData._id
            })
        }

        if (!existingWorkspace) {
            throw new InternalServerErrorException(
                'Failed to create or update workspace'
            )
        }

        await this.dataService.users.updateOne(
            { _id: userData._id },
            {
                $set: {
                    currentWorkspace: existingWorkspace._id
                },
                $addToSet: {
                    workspaces: existingWorkspace._id
                }
            }
        )
        return existingWorkspace
    }

    async getGroupRepositories(
        groupId: string,
        user: any
    ): Promise<Repository[]> {
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
        return await this.gitlabApiService.getGroupRepositories(
            userData.accessToken,
            groupId
        )
    }

    async getUserRepositories(
        userId: string,
        user: any
    ): Promise<Repository[]> {
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
        return await this.gitlabApiService.getUserRepositories(
            userData.accessToken,
            userId
        )
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
    ): Promise<PullRequestResponse[]> {
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

        return await this.gitlabApiService.getMergeRequests(
            userData.accessToken,
            projectId,
            state,
            limit
        )
    }

    async processGitlabEvent(event: any, payload: any) {
        let mergeRequestFormattedData: StructuredPRData | boolean
        switch (event) {
            case 'Merge Request Hook':
                mergeRequestFormattedData =
                    await this.gitlabEventsService.handleGitlabMergeRequest(
                        payload
                    )
                break
            default:
                mergeRequestFormattedData = false
        }
        console.log('mergeRequestFormattedData', mergeRequestFormattedData)
        if (mergeRequestFormattedData) {
            await this.httpService.post(
                this.configService.get('AI_AGENT_PR_POST_URL') as string,
                mergeRequestFormattedData
            )
        }
        return mergeRequestFormattedData
    }
}
