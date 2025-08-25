import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
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

        Promise.all(
            repositories.map(async (repository) => {
                let repositoryData =
                    await this.dataService.repositories.findOne({
                        id: repository['id'],
                        provider: userData.provider,
                        workspace: userData?.currentWorkspace!._id
                    })
                if (!repositoryData) {
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
                    await this.dataService.repositories.updateOne(
                        { _id: repositoryData['_id'] },
                        {
                            $set: {
                                ...repository,
                                isActive: true
                            }
                        }
                    )
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
        const userData =
            await this.analysisService.getUserDataWithWorkspace(user)
        return this.dataService.repositories.find({
            workspace: userData?.currentWorkspace!._id,
            ...query
        })
    }

    async updateRepository(id: string, body: UpdateRepositoryDto) {
        await this.dataService.repositories.updateOne(
            { _id: id },
            { $set: { ...body } }
        )
        return await this.dataService.repositories.findOne({ _id: id })
    }

    async findPRs(user: any, query: any) {
        const userData =
            await this.analysisService.getUserDataWithWorkspace(user)

        // Calculate date 30 days ago
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        return this.dataService.pullRequests
            .find({
                owner: userData?.currentWorkspace!['slug'],
                createdAt: {
                    $gte: thirtyDaysAgo
                },
                ...query
            })
            .select(
                'provider prTitle prUser prUserAvatar owner repo prNumber prUrl prId prCreatedAt prUpdatedAt  prMergedAt prState'
            )
    }
}
