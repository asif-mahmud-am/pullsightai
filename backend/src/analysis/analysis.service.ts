import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Types } from 'mongoose'
import { PullRequestAnalysisCommentsDto } from 'src/analysis/dto/post-analysis-comments.dto'
import { PullRequestAnalysisDto } from 'src/analysis/dto/post-analysis.dto'
import { BitbucketEventsService } from 'src/bitbucket/bitbucket-events.service'
import { HttpService } from 'src/common/http/http.service'
import { StructuredPRData } from 'src/common/interfaces/pr.interface'
import { DatabaseService } from 'src/database/database.service'
import { Status } from 'src/database/schemas/pull-request-analysis.schema'
import { PRReviewDto } from 'src/github/dto/install-repo.dto'
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

    async getUserDataWithWorkspace(user: any) {
        const userData = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate('currentWorkspace')
        if (!userData || !userData?.currentWorkspace) {
            throw new Error('User or current workspace not found')
        }
        return userData
    }

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
                startedAt: new Date(),
                pullRequest: savedPullRequestFormattedData._id
            })
        this.httpService.post(
            this.configService.get('AI_AGENT_PR_POST_URL') as string,
            {
                pullRequest: {
                    ...pullRequestFormattedData.pullRequest,
                    pullRequestAnalysisId: pullRequestAnalysis['_id']
                }
            }
        )
        return {
            pullRequestAnalysisId: pullRequestAnalysis['_id'],
            pullRequest: savedPullRequestFormattedData
        }
    }

    async addPRReviewComments(postReviewDto: PullRequestAnalysisCommentsDto) {
        let analysis
        if (postReviewDto.completed) {
            analysis =
                await this.dataService.pullRequestAnalysis.findOneAndUpdate(
                    {
                        _id: postReviewDto.pullRequestAnalysisId
                    },
                    {
                        $set: {
                            status: Status.COMPLETED,
                            completedAt: new Date()
                        }
                    },
                    { new: true }
                )
        } else {
            analysis = await this.dataService.pullRequestAnalysis.findOne({
                _id: postReviewDto.pullRequestAnalysisId
            })
        }

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
                            Types.ObjectId.createFromHexString(
                                postReviewDto.pullRequestAnalysisId
                            )
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
                await this.gitlabEventsService.addPRReviewComments(
                    analysis,
                    createdComments
                )
                break
            default:
                throw new Error('Unsupported provider')
        }
        return {}
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
            case 'bitbucket':
                await this.bitbucketEventsService.addPRSummery(analysis)
                break
            case 'gitlab':
                await this.gitlabEventsService.addPRSummery(analysis)
                break
            default:
                throw new Error('Unsupported provider')
        }
        return {
            summary: postSummery.summary,
            status: 'added'
        }
    }

    async getExistingPullRequestAndAnalysis(
        prReviewDto: PRReviewDto,
        provider: string
    ) {
        const pullRequestAnalysis =
            await this.dataService.pullRequestAnalysis.findOne({
                repositorySlug: prReviewDto.repo,
                prNumber: prReviewDto.prNumber,
                provider: provider
            })
        if (!pullRequestAnalysis) {
            return false
        }
        return {
            pullRequestAnalysisId: pullRequestAnalysis['_id'],
            pullRequest: await this.dataService.pullRequests.findOne({
                _id: pullRequestAnalysis.pullRequest
            }),
            pullRequestAnalysis: {
                ...pullRequestAnalysis.toObject(),
                comments:
                    await this.dataService.pullRequestAnalysisComments.find({
                        pullRequestAnalysisId: pullRequestAnalysis['_id']
                    })
            }
        }
    }

    async getPRAnalysisData(pullRequestAnalysisId: string) {
        const analysis = await this.dataService.pullRequestAnalysis.findOne({
            _id: pullRequestAnalysisId
        })
        if (!analysis) {
            throw new Error('Pull request analysis not found')
        }
        return {
            ...analysis.toObject(),
            comments: await this.dataService.pullRequestAnalysisComments.find({
                pullRequestAnalysisId: Types.ObjectId.createFromHexString(
                    pullRequestAnalysisId
                )
            })
        }
    }
}
