import {
    BadRequestException,
    Injectable,
    InternalServerErrorException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BitbucketEventsService } from 'src/bitbucket/bitbucket-events.service'
import { AddWorkspaceDto } from 'src/common/dto/add-workspace.dto'
import { HttpService } from 'src/common/http/http.service'
import { StructuredPRData } from 'src/common/interfaces/pr.interface'
import { Repository } from 'src/common/interfaces/repository.interface'
import { DatabaseService } from 'src/database/database.service'
import { Workspace } from 'src/database/schemas/workspace.schema'
import { GetPRDto, PRReviewDto } from 'src/github/dto/install-repo.dto'
import { BitbucketApiService } from './bitbucket-api.service'

@Injectable()
export class BitbucketService {
    constructor(
        private readonly dataService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly bitbucketApiService: BitbucketApiService,
        private readonly httpService: HttpService,
        private readonly bitbucketEventsService: BitbucketEventsService
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
        return await this.bitbucketApiService.addWebhook(
            userData?.accessToken as string,
            userData?.currentWorkspace['slug'] as string,
            repo,
            webhookUrl,
            events
        )
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
            userData?.currentWorkspace['name'] as string,
            getPRDto.repo,
            getPRDto.status,
            +getPRDto.limit
        )
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

    async makePRReview(user: any, prReviewDto: PRReviewDto) {
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
        console.log('PrAndRepo:', PrAndRepo)
        const pullRequestFormattedData =
            await this.bitbucketEventsService.handleBitbucketPullRequest(
                PrAndRepo
            )

        // const response = await this.httpService.post(
        //     this.configService.get('AI_AGENT_PR_REVIEW_URL') as string,
        //     pullRequestFormattedData
        // )
        return {
            ...pullRequestFormattedData,
            // ...response
        }
    }
}
