import { Module } from '@nestjs/common'
import { BitbucketModule } from 'src/bitbucket/bitbucket.module'
import { GithubModule } from 'src/github/github.module'
import { GitlabModule } from 'src/gitlab/gitlab.module'
import { WorkspaceController } from './workspace.controller'
import { WorkspaceService } from './workspace.service'

@Module({
    controllers: [WorkspaceController],
    providers: [WorkspaceService],
    imports: [GitlabModule, BitbucketModule, GithubModule]
})
export class WorkspaceModule {}
