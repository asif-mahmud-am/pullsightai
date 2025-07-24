import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { Response } from 'express'
import { SUCCESS } from 'src/common/utils/response-message.util'
import { AuthService } from './auth.service'

@Controller({
    path: 'auth',
    version: '1'
})
export class AuthController {
    clientUrl: string
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) {
        this.clientUrl = this.configService.get('CLIENT_URL') || ''
    }

    @Get('github')
    @UseGuards(AuthGuard('github'))
    githubLogin() {}

    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    githubCallback(@Req() req, @Res() res: Response) {
        return {
            redirect: this.clientUrl,
            token: this.authService.generateJwt(req.user)
        }
    }

    @Get('bitbucket')
    @UseGuards(AuthGuard('bitbucket'))
    bitbucketLogin() {}

    @Get('bitbucket/callback')
    @UseGuards(AuthGuard('bitbucket'))
    bitbucketCallback(@Req() req, @Res() res: Response) {
        return {
            redirect: this.clientUrl,
            token: this.authService.generateJwt(req.user)
        }
    }

    @Get('gitlab')
    @UseGuards(AuthGuard('gitlab'))
    gitlabLogin() {}

    @Get('gitlab/callback')
    @UseGuards(AuthGuard('gitlab'))
    gitlabCallback(@Req() req, @Res() res: Response) {
        return {
            redirect: this.clientUrl,
            token: this.authService.generateJwt(req.user)
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('profile')
    getProfile(@Req() req) {
        return {
            message: SUCCESS,
            result: req.user
        }
    }
}
