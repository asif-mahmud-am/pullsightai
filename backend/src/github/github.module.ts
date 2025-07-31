import { Module } from '@nestjs/common'
import { GithubEventService } from 'src/github/github-events.service'
import { GithubController } from './github.controller'
import { GithubService } from './github.service'
import { BitbucketModule } from '../bitbucket/bitbucket.module';

@Module({
    controllers: [GithubController],
    providers: [GithubService, GithubEventService],
    imports: [BitbucketModule]
})
export class GithubModule {}
