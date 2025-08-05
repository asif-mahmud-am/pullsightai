import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AddWorkspaceDto } from 'src/common/dto/add-workspace.dto'
import { AddWebhookDto } from './dto/add-webhook.dto'
import { GitlabService } from './gitlab.service'

@Controller({
    path: 'gitlab',
    version: '1'
})
export class GitlabController {
    constructor(private readonly gitlabService: GitlabService) {}

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('organizations')
    async getAllGroups(@Req() req) {
        return {
            message: 'Organizations fetched successfully',
            result: await this.gitlabService.getAllGroups(req.user)
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Post('add-workspace')
    async addWorkspace(
        @Req() req: any,
        @Body() addWorkspaceDto: AddWorkspaceDto
    ) {
        return {
            message: 'Workspace added successfully',
            result: await this.gitlabService.addWorkspace(
                req.user,
                addWorkspaceDto
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('org-repos')
    async getAllRepositories(@Req() req) {
        return {
            message: 'All repositories fetched successfully',
            result: await this.gitlabService.getAllRepositories(req.user)
        }
    }

    @Get('user')
    async getUserProfile(@Query('access_token') accessToken: string) {
        return {
            message: 'User profile fetched successfully',
            result: await this.gitlabService.getUserProfile(accessToken)
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('repositories/:orgId')
    async getOrganizationRepositories(
        @Param('orgId') orgId: string,
        @Req() req
    ) {
        // Check if the orgId is numeric (group) or if it matches a user
        const isNumeric = /^\d+$/.test(orgId)

        if (isNumeric) {
            // It's a group ID
            return {
                message: 'Group repositories fetched successfully',
                result: await this.gitlabService.getGroupRepositories(
                    orgId,
                    req.user
                )
            }
        } else {
            // It's a user ID/username
            return {
                message: 'User repositories fetched successfully',
                result: await this.gitlabService.getUserRepositories(
                    orgId,
                    req.user
                )
            }
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('repos-pr-list')
    async getMergeRequests(
        @Query('project_id') projectId: string,
        @Req() req,
        @Query('state') state?: 'opened' | 'closed' | 'merged' | 'all',
        @Query('limit') limit?: number
    ) {
        return {
            message: 'Merge requests fetched successfully',
            result: await this.gitlabService.getMergeRequests(
                projectId,
                req.user,
                state,
                limit
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Post('add-webhook')
    async addWebhook(@Body() addWebhookDto: AddWebhookDto, @Req() req) {
        return {
            message: 'Webhook added successfully',
            result: await this.gitlabService.addWebhook(
                req.user,
                addWebhookDto.project_id,
                addWebhookDto.webhookUrl,
                addWebhookDto.events
            )
        }
    }

    @Post('events')
    async gitlabEvents(@Body() body: any, @Req() req) {
        const event = req.headers['x-gitlab-event']
        console.log('Received GitLab event type:', event)
        console.log('Received GitLab event:', body)
        return {
            message: 'GitLab events processed successfully',
            result: await this.gitlabService.processGitlabEvent(event, body)
        }
    }
}
