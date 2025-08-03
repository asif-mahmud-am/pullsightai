import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { BitbucketService } from './bitbucket.service'
import { AddWebhookDto } from './dto/add-webhook.dto'

@Controller({
    path: 'bitbucket',
    version: '1'
})
export class BitbucketController {
    constructor(private readonly bitbucketService: BitbucketService) {}

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('organizations')
    async getAllWorkspaces(@Req() req) {
        return {
            message: 'Organizations fetched successfully',
            result: await this.bitbucketService.getAllWorkspaces(req.user)
        }
    }

    @Get('user')
    async getUserProfile(@Query('access_token') accessToken: string) {
        return {
            message: 'User profile fetched successfully',
            result: await this.bitbucketService.getUserProfile(accessToken)
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('org-repos/')
    async getWorkspaceRepositories(@Req() req: any) {
        return {
            message: 'Workspace repositories fetched successfully',
            result: await this.bitbucketService.getWorkspaceRepositories(
                req.user
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('repos-pr-list')
    async getPullRequests(
        @Query('workspace') workspace: string,
        @Query('repo') repository: string,
        @Req() req,
        @Query('state') state?: 'OPEN' | 'MERGED' | 'DECLINED' | 'SUPERSEDED',
        @Query('limit') limit?: number
    ) {
        return {
            message: 'Pull requests fetched successfully',
            result: await this.bitbucketService.getPullRequests(
                workspace,
                repository,
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
            result: await this.bitbucketService.addWebhook(
                addWebhookDto.access_token,
                addWebhookDto.repository,
                addWebhookDto.workspace,
                addWebhookDto.webhook_url,
                addWebhookDto.events
            )
        }
    }

    @Post('events')
    async bitbucketEvents(@Body() body: any, @Req() req) {
        const event = req.headers['x-event-key']
        return {
            message: 'Bitbucket events processed successfully',
            result: await this.bitbucketService.processBitbucketEvent(
                event,
                body
            )
        }
    }
}
