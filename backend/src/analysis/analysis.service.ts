import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PullRequestAnalysisCommentsDto } from 'src/analysis/dto/post-analysis-comments.dto'
import { PullRequestAnalysisDto } from 'src/analysis/dto/post-analysis.dto'
import { BitbucketEventsService } from 'src/bitbucket/bitbucket-events.service'
import { HttpService } from 'src/common/http/http.service'
import { StructuredPRData } from 'src/common/interfaces/pr.interface'
import { DatabaseService } from 'src/database/database.service'
import { Status } from 'src/database/schemas/pull-request-analysis.schema'
import { GithubEventService } from 'src/github/github-events.service'
import { GitlabEventsService } from 'src/gitlab/gitlab-events.service'

@Injectable()
export class AnalysisService {
    constructor(
        private readonly dataService: DatabaseService,
        // @Inject(forwardRef(() => GithubEventService))
        private readonly githubEventService: GithubEventService,
        private readonly bitbucketEventsService: BitbucketEventsService,
        private readonly gitlabEventsService: GitlabEventsService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {}

    async makeAnalysis(pullRequestFormattedData: StructuredPRData) {
        const savedPullRequestFormattedData =
            await this.dataService.pullRequests.create({
                ...pullRequestFormattedData.pullRequest
            })
        const pullRequestAnalysis =
            await this.dataService.pullRequestAnalysis.create({
                prId: savedPullRequestFormattedData.prId,
                provider: savedPullRequestFormattedData.provider,
                prUser: savedPullRequestFormattedData.prUser,
                workspaceSlug: savedPullRequestFormattedData.owner,
                repositorySlug: savedPullRequestFormattedData.repo,
                prNumber: savedPullRequestFormattedData.prNumber,
                installationId: savedPullRequestFormattedData.installationId,
                status: Status.INPROGRESS,
                startedAt: new Date()
            })
        await this.httpService.post(
            this.configService.get('AI_AGENT_PR_POST_URL') as string,
            {
                pullRequest: {
                    ...pullRequestFormattedData.pullRequest,
                    pullRequestAnalysisId: pullRequestAnalysis['_id']
                }
            }
        )
    }

    async addPRReviewComments(postReviewDto: PullRequestAnalysisCommentsDto) {
        const analysis = await this.dataService.pullRequestAnalysis.findOne({
            _id: postReviewDto.pullRequestAnalysisId
        })

        if (!analysis) {
            throw new Error('Pull request analysis not found')
        }

        // Create all comments in parallel
        const createdComments = await Promise.all(
            postReviewDto.comments.map(async (comment) => {
                return await this.dataService.pullRequestAnalysisComments.create(
                    {
                        ...comment,
                        pullRequestAnalysisId:
                            postReviewDto.pullRequestAnalysisId
                    }
                )
            })
        )

        switch (analysis.provider) {
            case 'github':
                await this.githubEventService.addPRReviewComments(
                    analysis,
                    createdComments
                )
                break
            case 'bitbucket':
                await this.bitbucketEventsService.addPRReviewComments(
                    analysis,
                    createdComments
                )
                break
            case 'gitlab':
                // Handle GitLab specific logic if needed
                break
            default:
                throw new Error('Unsupported provider')
        }

        return {
            message: 'Comments added successfully',
            count: createdComments.length,
            comments: createdComments
        }
    }

    async addPRSummery(postSummery: PullRequestAnalysisDto) {
        const analysis =
            await this.dataService.pullRequestAnalysis.findOneAndUpdate(
                {
                    _id: postSummery.pullRequestAnalysisId
                },
                {
                    $set: {
                        summary: postSummery.summary,
                        status: 'completed',
                        completedAt: new Date(),
                        modelInfo: postSummery.modelInfo,
                        usageInfo: postSummery.usageInfo
                    }
                },
                { new: true }
            )

        if (!analysis) {
            throw new Error('Pull request analysis not found')
        }

        switch (analysis.provider) {
            case 'github':
                await this.githubEventService.addPRSummery(analysis)
                break
            case 'gitlab':
                // Handle GitLab specific logic if needed
                break
            default:
                throw new Error('Unsupported provider')
        }
        return {
            summary: postSummery.summary,
            status: 'added'
        }
    }
}
