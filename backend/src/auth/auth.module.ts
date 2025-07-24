import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'
import { Schema } from 'mongoose'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { BitbucketStrategy } from './strategies/bitbucket.strategy'
import { GithubStrategy } from './strategies/github.strategy'
import { GitlabStrategy } from './strategies/gitlab.strategy'

const UserSchema = new Schema(
    {
        provider: { type: String, required: true },
        providerId: { type: String, required: true },
        username: String,
        displayName: String,
        email: String,
        avatarUrl: String,
        accessToken: String,
        refreshToken: String
    },
    { timestamps: true }
)

@Module({
    imports: [
        PassportModule,
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'default_secret',
            signOptions: { expiresIn: '1d' }
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, GithubStrategy, BitbucketStrategy, GitlabStrategy]
})
export class AuthModule {}
