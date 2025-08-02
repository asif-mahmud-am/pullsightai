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
}

export class PRReviewDto {
    @IsString()
    @IsNotEmpty()
    repo: string

    @IsString()
    @IsNotEmpty()
    prNumber: string
}

export class InstallCallbackDto {
    @IsString()
    @IsNotEmpty()
    installation_id: string

    @IsString()
    @IsNotEmpty()
    state: string
}
