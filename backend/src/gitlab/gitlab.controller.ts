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
import { PaginateDto } from 'src/common/dto/paginate.dto'
import { GetPRDto, PRReviewDto } from 'src/github/dto/install-repo.dto'
import { GitlabEventsService } from './gitlab-events.service'
import { GitlabService } from './gitlab.service'

@Controller({
    path: 'gitlab',
    version: '1'
})
export class GitlabController {
    constructor(
        private readonly gitlabService: GitlabService,
        private readonly gitlabEventsService: GitlabEventsService
    ) {}

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
    async getAllRepositories(@Req() req, @Query('filter') filter?: string) {
        return {
            message: 'All repositories fetched successfully',
            result: await this.gitlabService.getAllRepositories(
                req.user,
                filter
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('user-repos')
    async getUserRepositories(@Req() req: any, @Query() paginate: PaginateDto) {
        return {
            message: 'User repositories fetched successfully',
            result: await this.gitlabService.listOrganizationSpecificRepositories(
                req.user,
                paginate
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('repos-pr-list')
    async getPullRequests(@Req() req: any, @Query() getPRDto: GetPRDto) {
        return {
            message: 'Merge requests fetched successfully',
            result: await this.gitlabService.getPullRequests(req.user, getPRDto)
        }
    }

    @Post('events')
    async gitlabEvents(@Body() body: any, @Req() req) {
        const event = req.headers['x-gitlab-event']
        this.gitlabService.processGitlabEvent(event, body)
        return {
            message: 'GitLab events processed successfully',
            result: {}
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('review-pr')
    async reviewPR(@Req() req: any, @Query() prReviewDto: PRReviewDto) {
        const reviewData = await this.gitlabService.makePRReview(
            req.user,
            prReviewDto
        )
        return {
            message: 'Pull request reviewed successfully',
            result: reviewData
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('org-members')
    async getMembers(@Req() req: any, @Query() query: any) {
        return {
            message: 'Organization members fetched successfully',
            result: await this.gitlabService.getOrgMembers(req.user, query)
        }
    }
}
