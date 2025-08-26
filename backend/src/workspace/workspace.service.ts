import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Types } from 'mongoose'
import { AnalysisService } from 'src/analysis/analysis.service'
import { BitbucketService } from 'src/bitbucket/bitbucket.service'
import { DatabaseService } from 'src/database/database.service'
import { MemberRole } from 'src/database/schemas/workspace-members.schema'
import { GitlabService } from 'src/gitlab/gitlab.service'
import { MakeSubscriptionDto } from 'src/workspace/dto/make-subscription.dto'
import { UpdateRepositoryDto } from 'src/workspace/dto/update-repository.dto'

@Injectable()
export class WorkspaceService {
    constructor(
        private readonly dataService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly analysisService: AnalysisService,
        private readonly gitlabService: GitlabService,
        private readonly bitbucketService: BitbucketService
    ) {}

    async setWebhook(userData, repository) {
        let repositoryData
        switch (userData?.provider) {
            case 'github':
                repositoryData = repository
                break
            case 'gitlab':
                repositoryData = await this.gitlabService.addWebhook(
                    userData,
                    repository
                )
                break
            case 'bitbucket':
                repositoryData = await this.bitbucketService.addWebhook(
                    userData,
                    repository
                )
                break
            default:
                throw new Error('Unsupported provider')
        }
        return repositoryData
    }
    async makeSubscription(
        makeSubscriptionDto: MakeSubscriptionDto,
        user: any
    ) {
        const userData =
            await this.analysisService.getUserDataWithWorkspace(user)
        let repositories = makeSubscriptionDto.repositories
        console.log('userData', userData)
        Promise.all(
            repositories.map(async (repository) => {
                let repositoryData =
                    await this.dataService.repositories.findOne({
                        id: repository['id'],
                        provider: userData.provider,
                        workspace: userData?.currentWorkspace!._id
                    })
                if (!repositoryData) {
                    repository['_id'] = repositoryData!._id // add the id for workspace webhook lookup
                    repository = await this.setWebhook(userData, repository)
                    await this.dataService.repositories.create({
                        ...repository,
                        provider: userData.provider,
                        workspace: userData?.currentWorkspace!._id,
                        isActive: true
                    })
                } else {
                    if (!repositoryData.webhookToken) {
                        repository = await this.setWebhook(userData, repository)
                    }
                    // await this.dataService.repositories.updateOne(
                    //     { _id: repositoryData['_id'] },
                    //     {
                    //         $set: {
                    //             ...repository,
                    //             isActive: true
                    //         }
                    //     }
                    // )
                }
            })
        )
        makeSubscriptionDto.members.map(async (member) => {
            const user = await this.dataService.workspaceMembers.findOne({
                providerId: member.providerId,
                provider: userData.provider,
                workspace: userData?.currentWorkspace!._id
            })
            if (!user) {
                await this.dataService.workspaceMembers.create({
                    providerId: member.providerId,
                    provider: userData.provider,
                    username: member.username,
                    role:
                        userData.providerId == member.providerId
                            ? MemberRole.OWNER
                            : MemberRole.OWNER,
                    user:
                        userData.providerId == member.providerId
                            ? userData._id
                            : null,
                    workspace: userData?.currentWorkspace!._id,
                    isActive: true,
                    invitedAt: new Date()
                })
            } else {
                await this.dataService.workspaceMembers.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            role:
                                userData.providerId == member.providerId
                                    ? MemberRole.OWNER
                                    : MemberRole.OWNER,
                            isActive: true
                        }
                    }
                )
            }
        })
        return {}
    }

    async findAllRepositories(user: any, query: any) {
        const { page, limit } = query
        const filter = { isActive: query.isActive }
        if (query.author) {
            filter['author.username'] = query.author
        }
        const userData =
            await this.analysisService.getUserDataWithWorkspace(user)
        return this.dataService.repositories.paginate(
            {
                workspace: userData?.currentWorkspace!._id,
                ...filter
            },
            { page, limit, sort: { _id: -1 } }
        )
    }

    async updateRepository(id: string, body: UpdateRepositoryDto, user) {
        await this.dataService.repositories.updateOne(
            { _id: id },
            { $set: { ...body } }
        )

        if (body.isActive === false) {
            const workspaceWebhookData =
                await this.dataService.workspaceWebhooks.findOne({
                    repository: new Types.ObjectId(id)
                })
            const accessToken = await this.dataService.users.findOne(
                { _id: user.sub, provider: user.provider },
                'accessToken'
            )
            if (workspaceWebhookData && accessToken) {
                await this.deleteWebhook(
                    workspaceWebhookData,
                    accessToken.accessToken
                )
            }
        }

        return await this.dataService.repositories.findOne({ _id: id })
    }

    async deleteWebhook(webhookData: any, accessToken: any) {
        switch (webhookData.provider) {
            case 'bitbucket':
                await this.bitbucketService.removeWebhook(
                    accessToken,
                    webhookData.workspaceSlug,
                    webhookData.workspaceRepoSlug,
                    webhookData.workspaceWebhookId
                )
                break
            case 'gitlab':
                await this.gitlabService.removeWebhook(
                    accessToken,
                    webhookData.workspaceRepoSlug,
                    webhookData.workspaceWebhookId
                )
                break
        }

        // Remove webhook record from database
        await this.dataService.workspaceWebhooks.deleteOne({
            _id: webhookData._id
        })
    }

    async findPRs(user: any, query: any) {
        const { page, limit, ...filter } = query
        const userData =
            await this.analysisService.getUserDataWithWorkspace(user)

        // Calculate date 30 days ago
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        return this.dataService.pullRequests.paginate(
            {
                owner: userData?.currentWorkspace!['slug'],
                // createdAt: {
                //     $gte: thirtyDaysAgo
                // },
                ...filter
            },
            {
                page,
                limit,
                sort: { _id: -1 },
                select: 'provider prTitle prUser prUserAvatar owner repo prNumber prUrl prId prCreatedAt prUpdatedAt  prMergedAt prState'
            }
        )
    }
}
