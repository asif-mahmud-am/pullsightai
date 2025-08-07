import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { PaginateModel } from 'mongoose'
import { EventLogDocument } from 'src/database/schemas/event-log.schema'
import { PullRequestAnalysisComment } from 'src/database/schemas/pull-request-analysis-comment.schema'
import { PullRequestAnalysis } from 'src/database/schemas/pull-request-analysis.schema'
import {
    Repository,
    RepositoryDocument
} from 'src/database/schemas/repository.schema'
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
    pullRequestAnalysisComments: PaginateModel<PullRequestAnalysisComment>
    pullRequestAnalysis: PaginateModel<PullRequestAnalysis>
    eventLogs: PaginateModel<EventLogDocument>
    constructor(
        @InjectModel(User.name)
        private UserRepository: PaginateModel<UserDocument>,
        @InjectModel(Workspace.name)
        private WorkspaceRepository: PaginateModel<WorkspaceDocument>,
        @InjectModel(Repository.name)
        private RepositoryRepository: PaginateModel<RepositoryDocument>,
        @InjectModel(PullRequestAnalysisComment.name)
        private PullRequestAnalysisCommentsRepository: PaginateModel<PullRequestAnalysisComment>,
        @InjectModel(PullRequestAnalysis.name)
        private PullRequestAnalysisRepository: PaginateModel<PullRequestAnalysis>
    ) {}
    onApplicationBootstrap() {
        this.users = this.UserRepository
        this.workspaces = this.WorkspaceRepository
        this.repositories = this.RepositoryRepository
        this.pullRequestAnalysisComments =
            this.PullRequestAnalysisCommentsRepository
        this.pullRequestAnalysis = this.PullRequestAnalysisRepository
    }
}
