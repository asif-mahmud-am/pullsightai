import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { PaginateModel } from 'mongoose'
import {
    Workspace,
    WorkspaceDocument
} from 'src/database/schemas/workspace.schema'
import { User, UserDocument } from './schemas/user.schema'

@Injectable()
export class DatabaseService {
    users: PaginateModel<UserDocument>
    workspaces: PaginateModel<WorkspaceDocument>
    constructor(
        @InjectModel(User.name)
        private UserRepository: PaginateModel<UserDocument>,
        @InjectModel(Workspace.name)
        private WorkspaceRepository: PaginateModel<WorkspaceDocument>
    ) {}
    onApplicationBootstrap() {
        this.users = this.UserRepository
        this.workspaces = this.WorkspaceRepository
    }
}
