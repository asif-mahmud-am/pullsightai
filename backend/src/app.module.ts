import { Module, Scope } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { AuthModule } from 'src/auth/auth.module'
import { validate } from 'src/common/config/env.validation'
import { AllExceptionsFilter } from 'src/common/filters/custom-exception.filter'
import { HttpModule } from 'src/common/http/http.module'
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor'
import { MailModule } from 'src/common/notifications/mail/mail.module'
import { DatabaseModule } from 'src/database/database.module'
import { PackModule } from 'src/pack/pack.module'
import { AnalysisModule } from './analysis/analysis.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DashboardModule } from './dashboard/dashboard.module'
import { GithubModule } from './github/github.module'
import { GitlabModule } from './gitlab/gitlab.module'
import { NotificationModule } from './notification/notification.module'
import { PlanModule } from './plan/plan.module'
import { WorkspaceModule } from './workspace/workspace.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            validate,
            isGlobal: true
        }),
        DatabaseModule,
        AuthModule,
        GithubModule,
        HttpModule,
        GitlabModule,
        AnalysisModule,
        WorkspaceModule,
        DashboardModule,
        MailModule,
        NotificationModule,
        PlanModule,
        PackModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            scope: Scope.REQUEST,
            useClass: ResponseInterceptor
        },
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter
        }
    ]
})
export class AppModule {}
