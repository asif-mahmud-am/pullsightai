import { Module } from '@nestjs/common'
import { GithubEventService } from 'src/github/github-events.service'
import { GithubController } from './github.controller'
import { GithubService } from './github.service'

@Module({
    controllers: [GithubController],
    providers: [GithubService, GithubEventService]
})
export class GithubModule {}
