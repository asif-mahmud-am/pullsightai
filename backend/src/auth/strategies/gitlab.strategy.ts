import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import axios from 'axios'
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
            scope: ['read_user' + ' api' + ' read_repository']
        })
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile
    ) {
        if (profile.emails.length === 0) {
            try {
                // Fetch user emails from GitLab API
                const emailResponse = await axios.get(
                    'https://gitlab.com/api/v4/user/emails',
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                )

                // Find primary email or first email
                const emails = emailResponse.data || []
                const primaryEmail =
                    emails.find((email) => email.primary) || emails[0]
                if (primaryEmail) {
                    // Add email to profile
                    profile.emails = [
                        {
                            value: primaryEmail.email,
                            verified: primaryEmail.confirmed_at !== null
                        }
                    ]
                }
            } catch (error) {
                console.error(
                    'Error fetching GitLab user emails:',
                    error.response?.data || error.message
                )
            }
        }

        return this.authService.findOrCreateUser(
            profile,
            'gitlab',
            accessToken,
            refreshToken
        )
    }
}
