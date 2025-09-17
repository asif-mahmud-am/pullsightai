import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InviteTeamMemberDto } from 'src/notification/dto/invite-team-github.dto'

@Injectable()
export class NotificationService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) {}

    async inviteTeamMember(inviteTeamMemberDto: InviteTeamMemberDto) {
        for (const userData of inviteTeamMemberDto.teamMembers) {
            try {
                console.log('Sending email to ', userData.email)

                // Create JWT token with user data
                const token = this.jwtService.sign({
                    email: userData.email,
                    name: userData.name,
                    organization: inviteTeamMemberDto.organization,
                    platform: inviteTeamMemberDto.platform
                })

                const teamInvitationUrl = `${this.configService.get('CLIENT_URL')}/join-team?token=${token}`

                await this.mailerService.sendMail({
                    to: userData.email,
                    subject: 'Team Invitation - PullSight AI',
                    template: './invite-team-member.hbs',
                    context: {
                        joinLink: teamInvitationUrl,
                        name: userData.name,
                        organization: inviteTeamMemberDto.organization,
                        platform: inviteTeamMemberDto.platform,
                        email: userData.email
                    }
                })
            } catch (err) {
                console.log('Error sending email to ', userData.email, err)
            }
        }
        return { message: 'Invitations sent successfully' }
    }
}
