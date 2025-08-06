import {
    BadRequestException,
    Injectable,
    InternalServerErrorException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AddWorkspaceDto } from 'src/common/dto/add-workspace.dto'
import { HttpService } from 'src/common/http/http.service'
import { StructuredPRData } from 'src/common/interfaces/pr.interface'
import {
    PullRequestResponse,
    Repository
} from 'src/common/interfaces/repository.interface'
import { DatabaseService } from 'src/database/database.service'
import { Workspace } from 'src/database/schemas/workspace.schema'
import { GetPRDto, PRReviewDto } from 'src/github/dto/install-repo.dto'
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
            provider: 'gitlab'
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

    async addWebhook(user: any, repo: string): Promise<any> {
        const userData = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate('currentWorkspace')
        if (
            !userData ||
            !userData?.accessToken ||
            !userData?.currentWorkspace
        ) {
            throw new Error(
                'User or current workspace not found or installation ID missing'
            )
        }

        const webhookUrl = `${this.configService.get('BASE_URL')}/v1/gitlab/events`
        const events = [
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

        return await this.gitlabApiService.addWebhook(
            userData?.accessToken,
            repo,
            webhookUrl,
            events
        )
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

    async getPullRequests(
        user: any,
        getPRDto: GetPRDto
    ): Promise<PullRequestResponse[]> {
        const userData = await this.dataService.users
            .findOne({ _id: user.sub }, 'accessToken currentWorkspace')
            .populate('currentWorkspace', 'slug type')
        if (!userData?.accessToken || !userData?.currentWorkspace) {
            throw new BadRequestException(
                'Access token is required or workspace not set'
            )
        }

        return await this.gitlabApiService.getPrList(
            userData.accessToken,
            getPRDto.repo,
            getPRDto.status,
            +getPRDto.limit
        )
    }

    async processGitlabEvent(event: any, payload: any) {
        let pullRequestFormattedData: StructuredPRData | boolean
        switch (event) {
            case 'Merge Request Hook':
                pullRequestFormattedData =
                    await this.gitlabEventsService.handleGitlabMergeRequest(
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

    async makePRReview(user: any, prReviewDto: PRReviewDto) {
        const userData = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate('currentWorkspace')

        if (!userData || !userData?.currentWorkspace) {
            throw new BadRequestException(
                'User or current workspace not found or installation ID missing'
            )
        }
        const PrAndRepo = await this.gitlabApiService.getPRAndRepo(
            userData.accessToken as string,
            userData?.currentWorkspace['slug'] as string,
            prReviewDto.repo,
            +prReviewDto.prNumber
        )
        const pullRequestFormattedData: StructuredPRData =
            await this.gitlabEventsService.handleGitlabMergeRequest(PrAndRepo)

        const response = await this.httpService.post(
            this.configService.get('AI_AGENT_PR_REVIEW_URL') as string,
            pullRequestFormattedData
        )
        return {
            ...pullRequestFormattedData,
            ...response
        }
    }
}
