import {
    BadRequestException,
    Injectable,
    InternalServerErrorException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AnalysisService } from 'src/analysis/analysis.service'
import { BitbucketEventsService } from 'src/bitbucket/bitbucket-events.service'
import { AddWorkspaceDto } from 'src/common/dto/add-workspace.dto'
import { PREvent } from 'src/common/enums/pr.enum'
import { HttpService } from 'src/common/http/http.service'
import { StructuredPRData } from 'src/common/interfaces/pr.interface'
import { Repository } from 'src/common/interfaces/repository.interface'
import { DatabaseService } from 'src/database/database.service'
import { Workspace } from 'src/database/schemas/workspace.schema'
import { GetPRDto, PRReviewDto } from 'src/github/dto/install-repo.dto'
import { RepositoryDto } from 'src/workspace/dto/make-subscription.dto'
import { BitbucketApiService } from './bitbucket-api.service'

@Injectable()
export class BitbucketService {
    constructor(
        private readonly dataService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly bitbucketApiService: BitbucketApiService,
        private readonly httpService: HttpService,
        private readonly bitbucketEventsService: BitbucketEventsService,
        private readonly analysisService: AnalysisService
    ) {}

    async getAllWorkspaces(user: any): Promise<Workspace[]> {
        const userData = await this.dataService.users.findOne(
            { _id: user.sub },
            'accessToken _id workspaces currentWorkspace'
        )
        if (!userData?.accessToken) {
            throw new BadRequestException('Access token is required')
        }
        return await this.bitbucketApiService.getAllWorkspaces(
            userData?.accessToken
        )
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

        const workspace = await this.bitbucketApiService.getSingleWorkspace(
            userData?.accessToken,
            addWorkspaceDto.slug
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

    async getWorkspaceRepositories(user: any): Promise<Repository[]> {
        const userData = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate('currentWorkspace')
        if (!userData || !userData?.currentWorkspace) {
            throw new Error(
                'User or current workspace not found or installation ID missing'
            )
        }

        return await this.bitbucketApiService.getWorkspaceRepositories(
            userData.accessToken as string,
            userData?.currentWorkspace['slug'] as string
        )
    }

    async addWebhook(userData: any, repository: RepositoryDto): Promise<any> {
        const webhookUrl = `${this.configService.get('BASE_URL')}/v1/bitbucket/events`
        const events = [
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
        const response = await this.bitbucketApiService.addWebhook(
            userData?.accessToken as string,
            userData?.currentWorkspace['slug'] as string,
            repository.slug,
            webhookUrl,
            events
        )
        return {
            ...repository,
            webhookToken: response.webhook.id
        }
    }

    async getPullRequests(user: any, getPRDto: GetPRDto) {
        const userData = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate('currentWorkspace')
        if (!userData || !userData?.currentWorkspace) {
            throw new Error(
                'User or current workspace not found or installation ID missing'
            )
        }

        return await this.bitbucketApiService.getPullRequests(
            userData.accessToken as string,
            userData?.currentWorkspace['slug'] as string,
            getPRDto.repo,
            getPRDto.status,
            +getPRDto.limit
        )
    }

    async processBitbucketEvent(event: any, payload: any) {
        console.log(`Processing Bitbucket event: ${event} ------->>`, payload)
        // await this.dataService.eventLogs.create({
        //     eventName: event,
        //     provider: 'bitbucket',
        //     eventPayload: event
        // })
        const isApplicable =
            await this.analysisService.checkApplicableForAnalysis(
                payload.repository.full_name.split('/')[1],
                payload.repository.owner.username,
                'bitbucket',
                payload.actor.uuid
            )
        if (!isApplicable) {
            return {}
        }

        let pullRequestFormattedData: StructuredPRData | boolean
        let prEvent
        switch (event) {
            case 'pullrequest:created':
                prEvent = PREvent.CREATED
                pullRequestFormattedData =
                    await this.bitbucketEventsService.handleBitbucketPullRequest(
                        payload,
                        prEvent
                    )
                break
            case 'pullrequest:updated':
                prEvent = PREvent.UPDATED
                pullRequestFormattedData =
                    await this.bitbucketEventsService.handleBitbucketPullRequest(
                        payload,
                        prEvent
                    )
                break
            default:
                pullRequestFormattedData = false
        }

        if (pullRequestFormattedData) {
            this.analysisService.makeAnalysis(pullRequestFormattedData, prEvent)
        }
        return {}
    }

    async makePRReview(user: any, prReviewDto: PRReviewDto) {
        const existingAnalysis =
            await this.analysisService.getExistingPullRequestAndAnalysis(
                prReviewDto,
                'bitbucket'
            )
        if (existingAnalysis) {
            return existingAnalysis
        }
        const userData = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate('currentWorkspace')

        if (!userData || !userData?.currentWorkspace) {
            throw new BadRequestException(
                'User or current workspace not found or installation ID missing'
            )
        }
        const PrAndRepo = await this.bitbucketApiService.getBitbucketPRAndRepo(
            userData.accessToken as string,
            userData?.currentWorkspace['slug'] as string,
            prReviewDto.repo,
            +prReviewDto.prNumber
        )
        const pullRequestFormattedData =
            await this.bitbucketEventsService.handleBitbucketPullRequest(
                PrAndRepo,
                PREvent.CREATED
            )

        if (!pullRequestFormattedData) {
            throw new InternalServerErrorException(
                'Failed to fetch pull request data'
            )
        }
        return await this.analysisService.makeAnalysis(
            pullRequestFormattedData,
            PREvent.CREATED
        )
    }

    async getOrgMembers(user: any) {
        const userData =
            await this.analysisService.getUserDataWithWorkspace(user)

        return await this.bitbucketApiService.getOrgMembers(
            userData.accessToken as string,
            userData?.currentWorkspace!['slug'] as string
        )
    }
}
