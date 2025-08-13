import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/database/database.module'
import { GitlabApiService } from 'src/gitlab/gitlab-api.service'
import { GitlabEventsService } from './gitlab-events.service'
import { GitlabController } from './gitlab.controller'
import { GitlabService } from './gitlab.service'

@Module({
    imports: [HttpModule, DatabaseModule],
    controllers: [GitlabController],
    providers: [GitlabService, GitlabApiService, GitlabEventsService],
    exports: [GitlabEventsService, GitlabService]
})
export class GitlabModule {}
