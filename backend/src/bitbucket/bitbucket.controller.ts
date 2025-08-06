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
import { AddWorkspaceDto } from 'src/common/dto/add-workspace.dto'
import { GetPRDto, PRReviewDto } from 'src/github/dto/install-repo.dto'
import { AddWebhookDto } from '../common/dto/add-webhook.dto'
import { BitbucketService } from './bitbucket.service'

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

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('org-repos')
    async getWorkspaceRepositories(@Req() req: any) {
        return {
            message: 'Workspace repositories fetched successfully',
            result: await this.bitbucketService.getWorkspaceRepositories(
                req.user
            )
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
            result: await this.bitbucketService.addWorkspace(
                req.user,
                addWorkspaceDto
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('repos-pr-list')
    async getPullRequests(@Req() req: any, @Query() getPRDto: GetPRDto) {
        return {
            message: 'Pull requests fetched successfully',
            result: await this.bitbucketService.getPullRequests(
                req.user,
                getPRDto
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('review-pr')
    async reviewPR(@Req() req: any, @Query() prReviewDto: PRReviewDto) {
        const reviewData = await this.bitbucketService.makePRReview(
            req.user,
            prReviewDto
        )
        return {
            message: 'Pull request reviewed successfully',
            result: reviewData
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Post('add-webhook')
    async addWebhook(@Body() addWebhookDto: AddWebhookDto, @Req() req: any) {
        return {
            message: 'Webhook added successfully',
            result: await this.bitbucketService.addWebhook(
                req.user,
                addWebhookDto.repo
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
