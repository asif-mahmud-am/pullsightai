import { Module } from '@nestjs/common'
import { GitlabApiService } from 'src/gitlab/gitlab-api.service'
import { GitlabController } from './gitlab.controller'
import { GitlabService } from './gitlab.service'
import { GitlabEventsService } from './gitlab-events.service'
import { DatabaseModule } from 'src/database/database.module'
import { HttpModule } from '@nestjs/axios'

@Module({
    imports: [HttpModule, DatabaseModule],
    controllers: [GitlabController],
    providers: [GitlabService, GitlabApiService, GitlabEventsService],
    exports: [GitlabService, GitlabApiService, GitlabEventsService]
})
export class GitlabModule {}
