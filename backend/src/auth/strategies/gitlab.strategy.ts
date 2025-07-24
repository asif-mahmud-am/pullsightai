import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-gitlab2'
import { AuthService } from 'src/auth/auth.service'

@Injectable()
export class GitlabStrategy extends PassportStrategy(Strategy, 'gitlab') {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) {
        super({
            clientID: configService.get('GITLAB_CLIENT_ID'),
            clientSecret: configService.get('GITLAB_CLIENT_SECRET'),
            callbackURL: `${configService.get('BASE_URL')}/v1/auth/gitlab/callback`,
            scope: ['read_user']
        })
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile
    ) {
        return this.authService.findOrCreateUser(
            profile,
            'gitlab',
            accessToken,
            refreshToken
        )
    }
}
