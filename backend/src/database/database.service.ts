import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { PaginateModel } from 'mongoose'
import {
    EventLog,
    EventLogDocument
} from 'src/database/schemas/event-log.schema'
import { Pack, PackDocument } from 'src/database/schemas/pack.schema'
import { Plan, PlanDocument } from 'src/database/schemas/plan.schema'
import {
    PullRequestAnalysisComment,
    PullRequestAnalysisCommentDocument
} from 'src/database/schemas/pull-request-analysis-comment.schema'
import {
    PullRequestAnalysis,
    PullRequestAnalysisDocument
} from 'src/database/schemas/pull-request-analysis.schema'
import {
    PullRequest,
    PullRequestDocument
} from 'src/database/schemas/pull-request.schema'
import {
    PurchasedPack,
    PurchasedPackDocument
} from 'src/database/schemas/purchasedPack.schema'
import {
    PurchasedPlan,
    PurchasedPlanDocument
} from 'src/database/schemas/purchasedPlan.schema'
import {
    Repository,
    RepositoryDocument
} from 'src/database/schemas/repository.schema'
import {
    Transaction,
    TransactionDocument
} from 'src/database/schemas/transaction.schema'
import {
    WorkspaceMember,
    WorkspaceMemberDocument
} from 'src/database/schemas/workspace-members.schema'
import {
    Workspace,
    WorkspaceDocument
} from 'src/database/schemas/workspace.schema'
import { User, UserDocument } from './schemas/user.schema'

@Injectable()
export class DatabaseService {
    users: PaginateModel<UserDocument>
    workspaces: PaginateModel<WorkspaceDocument>
    repositories: PaginateModel<RepositoryDocument>
    pullRequestAnalysisComments: PaginateModel<PullRequestAnalysisCommentDocument>
    pullRequestAnalysis: PaginateModel<PullRequestAnalysisDocument>
    eventLogs: PaginateModel<EventLogDocument>
    pullRequests: PaginateModel<PullRequestDocument>
    workspaceMembers: PaginateModel<WorkspaceMemberDocument>
    plans: PaginateModel<PlanDocument>
    packs: PaginateModel<PackDocument>
    purchasedPlans: PaginateModel<PurchasedPlanDocument>
    purchasedPacks: PaginateModel<PurchasedPackDocument>
    transactions: PaginateModel<TransactionDocument>
    constructor(
        @InjectModel(User.name)
        private UserRepository: PaginateModel<UserDocument>,
        @InjectModel(Workspace.name)
        private WorkspaceRepository: PaginateModel<WorkspaceDocument>,
        @InjectModel(Repository.name)
        private RepositoryRepository: PaginateModel<RepositoryDocument>,
        @InjectModel(PullRequestAnalysisComment.name)
        private PullRequestAnalysisCommentsRepository: PaginateModel<PullRequestAnalysisCommentDocument>,
        @InjectModel(PullRequestAnalysis.name)
        private PullRequestAnalysisRepository: PaginateModel<PullRequestAnalysisDocument>,
        @InjectModel(EventLog.name)
        private EventLogRepository: PaginateModel<EventLogDocument>,
        @InjectModel(PullRequest.name)
        private PullRequestRepository: PaginateModel<PullRequestDocument>,
        @InjectModel(WorkspaceMember.name)
        private TeamMemberRepository: PaginateModel<WorkspaceMemberDocument>,
        @InjectModel(Plan.name)
        private PlanRepository: PaginateModel<PlanDocument>,
        @InjectModel(Pack.name)
        private PackRepository: PaginateModel<PackDocument>,
        @InjectModel(PurchasedPlan.name)
        private PurchasedPlanRepository: PaginateModel<PurchasedPlanDocument>,
        @InjectModel(PurchasedPack.name)
        private PurchasedPackRepository: PaginateModel<PurchasedPackDocument>,
        @InjectModel(Transaction.name)
        private TransactionRepository: PaginateModel<TransactionDocument>
    ) {}
    onApplicationBootstrap() {
        this.users = this.UserRepository
        this.workspaces = this.WorkspaceRepository
        this.repositories = this.RepositoryRepository
        this.pullRequestAnalysisComments =
            this.PullRequestAnalysisCommentsRepository
        this.pullRequestAnalysis = this.PullRequestAnalysisRepository
        this.eventLogs = this.EventLogRepository
        this.pullRequests = this.PullRequestRepository
        this.workspaceMembers = this.TeamMemberRepository
        this.plans = this.PlanRepository
        this.packs = this.PackRepository
        this.purchasedPlans = this.PurchasedPlanRepository
        this.purchasedPacks = this.PurchasedPackRepository
        this.transactions = this.TransactionRepository
    }
}
