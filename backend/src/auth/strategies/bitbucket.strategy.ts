import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-bitbucket-oauth2'
import { AuthService } from '../auth.service'

@Injectable()
export class BitbucketStrategy extends PassportStrategy(Strategy, 'bitbucket') {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) {
        super({
            clientID: configService.get('BITBUCKET_CLIENT_ID'),
            clientSecret: configService.get('BITBUCKET_CLIENT_SECRET'),
            callbackURL: `${configService.get('BASE_URL')}/v1/auth/bitbucket/callback`,
            scope: ['email']
        })
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile
    ) {
        return this.authService.findOrCreateUser(
            profile,
            'bitbucket',
            accessToken,
            refreshToken
        )
    }
}
