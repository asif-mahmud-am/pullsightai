import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { GetPRDto, InstallRepoDto } from 'src/github/dto/install-repo.dto'
import { PostReviewDto } from 'src/github/dto/post-review.dto'
import { PostSummeryDto } from 'src/github/dto/post-summery.dto'
import { GithubEventService } from 'src/github/github-events.service'
import { GithubService } from './github.service'

@Controller({
    path: 'github',
    version: '1'
})
export class GithubController {
    constructor(
        private readonly githubService: GithubService,
        private readonly githubEventService: GithubEventService,
        private readonly configService: ConfigService
    ) {}

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('organizations')
    async getOrgs(@Req() req) {
        console.log(req.user)
        return {
            message: 'Organizations fetched successfully',
            result: await this.githubService.getUserOrganizations(req.user)
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('install')
    async redirectToGitHubApp(
        @Query() installRepoDto: InstallRepoDto,
        @Req() req
    ) {
        const org = await this.githubService.createWorkspace(
            req.user,
            installRepoDto
        )
        const appSlug = this.configService.get<string>('GITHUB_APP_SLUG')
        const redirect = `https://github.com/apps/${appSlug}/installations/new/permissions?target_id=${installRepoDto.id}&target_type=${installRepoDto.type}`
        return {
            redirect
        }
    }

    @Get('callback')
    async githubCallback(@Query('installation_id') installationId: string) {
        const org = await this.githubService.listInstallationRepositories(
            Number(installationId)
        )
        const redirect = `${this.configService.get<string>('CLIENT_URL')}/onboarding/step-3?name=${org}&installationId=${installationId}`
        return { redirect }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('org-repos')
    async getOrgRepos(@Req() req: any) {
        const repos = await this.githubService.listOrgRepositories(req.user)
        return {
            message: 'Repositories fetched successfully',
            result: repos
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('repos-pr-list')
    async getRepoPRList(@Req() req: any, @Query() getPRDto: GetPRDto) {
        const repos = await this.githubService.listRepoPullRequests(
            req.user,
            getPRDto
        )
        return {
            message: 'Repositories fetched successfully',
            result: repos
        }
    }

    @Post('events')
    async githubEvents(@Body() body: any, @Req() req) {
        console.log('Received GitHub event:')
        const event = req.headers['x-github-event']
        return {
            message: 'GitHub events processed successfully',
            result: await this.githubService.processGithubEvent(event, body)
        }
    }

    @Post('reviews')
    async postReview(@Body() postReviewDto: PostReviewDto) {
        console.log('========Post Review DTO:==========', postReviewDto)
        return {
            message: 'Review posted successfully',
            result: await this.githubEventService.addPRReviewComments(
                postReviewDto
            )
        }
    }

    @Post('summary')
    async postSummary(@Body() postSummery: PostSummeryDto) {
        return {
            message: 'Summary posted successfully',
            result: await this.githubEventService.addPRSummery(postSummery)
        }
    }

    @Post('suggestions')
    async postSuggestions(@Body() name: string) {
        return {
            message: 'Suggestions posted successfully',
            result: {}
        }
    }

    @Post('post-pr')
    async postPr(@Body() body: string) {
        console.log('Post PR body:', body)
        return {
            message: 'Post Pr successfully',
            result: {}
        }
    }
}
