import { IsDateString, IsOptional, IsIn } from "class-validator";

export class PrAnalysisCardFilterDto {

    @IsOptional()
    repo: string;

    //2025-08-16T21:41:22.665Z
    @IsOptional()
    @IsDateString()
    from: string

    @IsOptional()
    @IsDateString()
    to: string

    @IsOptional()
    @IsIn(['day', 'month', 'year'])
    breakdown?: 'day' | 'month' | 'year'
}
