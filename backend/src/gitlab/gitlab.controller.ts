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
import { AddWebhookDto } from './dto/add-webhook.dto'
import { GitlabService } from './gitlab.service'

@Controller({
    path: 'gitlab',
    version: '1'
})
export class GitlabController {
    constructor(private readonly gitlabService: GitlabService) {}

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('repositories')
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
    @Get('organizations')
    async getAllGroups(@Req() req) {
        return {
            message: 'Groups fetched successfully',
            result: await this.gitlabService.getAllGroups(req.user)
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('repositories/:groupId')
    async getGroupRepositories(@Param('groupId') groupId: string, @Req() req) {
        return {
            message: 'Group repositories fetched successfully',
            result: await this.gitlabService.getGroupRepositories(
                groupId,
                req.user
            )
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

    @Post('add-webhook')
    async addWebhook(@Body() addWebhookDto: AddWebhookDto) {
        return {
            message: 'Webhook added successfully',
            result: await this.gitlabService.addWebhook(
                addWebhookDto.access_token,
                addWebhookDto.project_id,
                addWebhookDto.webhook_url,
                addWebhookDto.events
            )
        }
    }
}
