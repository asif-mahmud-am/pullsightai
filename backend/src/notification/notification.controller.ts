import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { InviteTeamMemberDto } from 'src/notification/dto/invite-team-github.dto'
import { JwtInvitationGuard } from './guards/jwt-invitation.guard'
import { NotificationService } from './notification.service'

@Controller({
    path: 'notification',
    version: '1'
})
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post('invite-team-member')
    // @UseGuards(AuthGuard('jwt-cookie'))
    async inviteTeamMember(@Body() inviteTeamMemberDto: InviteTeamMemberDto) {
        const result =
            this.notificationService.inviteTeamMember(inviteTeamMemberDto)
        return {
            message: 'Invitation sent successfully',
            result
        }
    }

    @Get('join-team')
    @UseGuards(JwtInvitationGuard)
    async joinTeam(@Req() req: any) {
        const user = req.user
        return {
            message: 'Token validated successfully',
            user: {
                email: user.email,
                name: user.name,
                organization: user.organization,
                platform: user.platform
            }
        }
    }
}
