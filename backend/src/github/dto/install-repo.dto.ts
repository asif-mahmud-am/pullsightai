import { Optional } from '@nestjs/common'
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

export class GetPRDto {
    @IsString()
    @IsNotEmpty()
    repo: string

    @Optional()
    status: string
}
