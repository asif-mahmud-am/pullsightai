import { Type } from 'class-transformer'
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator'

export class ReviewComment {
    @IsString()
    path: string

    @IsNumber()
    position: number

    @IsString()
    body: string
}

export class PostReviewDto {
    @IsString()
    owner: string

    @IsString()
    repo: string

    @IsNumber()
    prNumber: number

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReviewComment)
    comments: ReviewComment[]

    @IsNumber()
    installationId: number
}
