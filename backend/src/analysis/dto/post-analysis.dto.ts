import {
    IsMongoId,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString
} from 'class-validator'

export class PullRequestAnalysisDto {
    @IsMongoId()
    pullRequestAnalysisId: string

    @IsNotEmpty()
    @IsString()
    summary: string

    @IsOptional()
    @IsObject()
    modelInfo?: any

    @IsOptional()
    @IsObject()
    usageInfo?: any

    @IsOptional()
    summary_info: any
}
