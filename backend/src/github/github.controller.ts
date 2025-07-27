import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { GithubService } from './github.service'

@Controller({
    path: 'github',
    version: '1'
})
export class GithubController {
    constructor(private readonly githubService: GithubService) {}

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('organizations')
    async getOrgs(@Req() req) {
        return {
            message: 'Organizations fetched successfully',
            result: await this.githubService.getUserOrganizations(req.user)
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('org/:org/repos')
    async getOrgRepos(@Param('org') org: string, @Req() req) {
        return {
            message: 'Repositories fetched successfully',
            result: await this.githubService.getOrgRepositories(org, req.user)
        }
    }

    @Get('user/repos')
    async getUserRepos() {
        return this.githubService.getUserRepositories()
    }
}
