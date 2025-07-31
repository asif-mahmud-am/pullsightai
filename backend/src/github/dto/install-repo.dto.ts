import { IsNotEmpty, IsString } from 'class-validator'

export class InstallRepoDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    id: string

    @IsString()
    @IsNotEmpty()
    type: string
}
