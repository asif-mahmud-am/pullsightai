import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { PaginateModel } from 'mongoose'
import { User, UserDocument } from './schemas/user.schema'

@Injectable()
export class DatabaseService {
    users: PaginateModel<UserDocument>
    constructor(
        @InjectModel(User.name)
        private UserRepository: PaginateModel<UserDocument>
    ) {}
    onApplicationBootstrap() {
        this.users = this.UserRepository
    }
}
