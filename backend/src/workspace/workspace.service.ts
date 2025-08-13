import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AnalysisService } from 'src/analysis/analysis.service'
import { BitbucketService } from 'src/bitbucket/bitbucket.service'
import { DatabaseService } from 'src/database/database.service'
import { MemberRole } from 'src/database/schemas/workspace-members.schema'
import { GitlabService } from 'src/gitlab/gitlab.service'
import { MakeSubscriptionDto } from 'src/workspace/dto/make-subscription.dto'
import { UpdateWorkspaceDto } from './dto/update-workspace.dto'

@Injectable()
export class WorkspaceService {
    constructor(
        private readonly dataService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly analysisService: AnalysisService,
        private readonly gitlabService: GitlabService,
        private readonly bitbucketService: BitbucketService
    ) {}

    async makeSubscription(
        makeSubscriptionDto: MakeSubscriptionDto,
        user: any
    ) {
        const userData =
            await this.analysisService.getUserDataWithWorkspace(user)
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

        let repositories = makeSubscriptionDto.repositories
        switch (userData?.provider) {
            // case 'github':
            //     await this.createGithubRepositories(
            //         makeSubscriptionDto,
            //         userData
            //     )
            //     break
            case 'gitlab':
                repositories = await this.gitlabService.addWebhook(
                    userData,
                    makeSubscriptionDto.repositories
                )
                break
            case 'bitbucket':
                await this.bitbucketService.addWebhook(
                    makeSubscriptionDto,
                    makeSubscriptionDto.repositories
                )
                break
            default:
                throw new Error('Unsupported provider')
        }
        Promise.all(
            repositories.map(async (repository) => {
                let repositoryData =
                    await this.dataService.repositories.findOne({
                        id: repository['id'],
                        provider: userData.provider,
                        workspace: userData?.currentWorkspace!._id
                    })
                if (!repositoryData) {
                    repositoryData = await this.dataService.repositories.create(
                        {
                            ...repository,
                            provider: userData.provider,
                            workspace: userData?.currentWorkspace!._id,
                            isActive: true
                        }
                    )
                } else {
                    await this.dataService.repositories.updateOne(
                        { _id: user._id },
                        {
                            $set: {
                                ...repository,
                                provider: userData.provider,
                                workspace: userData?.currentWorkspace!._id,
                                isActive: true
                            }
                        }
                    )
                }
            })
        )
        return {}
    }

    findAll() {
        return `This action returns all workspace`
    }

    findOne(id: number) {
        return `This action returns a #${id} workspace`
    }

    update(id: number, updateWorkspaceDto: UpdateWorkspaceDto) {
        return `This action updates a #${id} workspace`
    }

    remove(id: number) {
        return `This action removes a #${id} workspace`
    }
}
