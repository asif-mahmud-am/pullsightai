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
import { InstallRepoDto } from 'src/github/dto/install-repo.dto'
import { PostReviewDto } from 'src/github/dto/post-review.dto'
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
        return {
            message: 'Organizations fetched successfully',
            result: await this.githubService.getUserOrganizations(req.user)
        }
    }

    @Get('install')
    redirectToGitHubApp(@Query() installRepoDto: InstallRepoDto) {
        const appSlug = this.configService.get<string>('GITHUB_APP_SLUG')
        const redirect = `https://github.com/apps/${appSlug}/installations/new/permissions?target_id=${installRepoDto.id}&target_type=${installRepoDto.type}&redirect_url=${this.configService.get<string>('BASE_URL')}/v1/github/callback`
        return {
            redirect
        }
    }

    @Get('callback')
    async githubCallback(@Query('installation_id') installationId: string) {
        const org = await this.githubService.listInstallationRepositories(
            Number(installationId)
        )
        const redirect = `${this.configService.get<string>('CLIENT_URL')}/repositories?name=${org}&installationId=${installationId}`
        return { redirect }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('org-repos')
    async getOrgRepos(
        @Query('name') name: string,
        @Query('installationId') installationId: string
    ) {
        const repos = await this.githubService.listOrgRepositories(
            name,
            Number(installationId)
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
        return {
            message: 'Review posted successfully',
            result: await this.githubEventService.addPRReviewComments(
                postReviewDto.owner,
                postReviewDto.repo,
                postReviewDto.prNumber,
                postReviewDto.comments,
                postReviewDto.installationId
            )
        }
    }

    @Post('summery')
    async postSummery(@Body() postSummery: any) {
        return {
            message: 'Summary posted successfully',
            result: {}
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
