import { Type } from 'class-transformer'
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator'

class TeamMember {
    @IsNotEmpty()
    email: string

    @IsNotEmpty()
    name: string
}

export class InviteTeamMemberDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TeamMember)
    teamMembers: TeamMember[]

    @IsNotEmpty()
    platform: string

    @IsNotEmpty()
    organization: string
}
