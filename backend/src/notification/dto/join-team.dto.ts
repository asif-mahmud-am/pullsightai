import { IsNotEmpty } from 'class-validator'

export class JoinTeamDto {
    @IsNotEmpty()
    token: string
}
