import { IsNotEmpty, IsString } from 'class-validator'

export class AddWorkspaceDto {
    @IsNotEmpty()
    @IsString()
    slug: string
}
