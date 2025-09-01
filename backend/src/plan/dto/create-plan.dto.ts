import { Type } from 'class-transformer'
import {
    IsArray,
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested
} from 'class-validator'

export class CreateFeatureDto {
    @IsString()
    title: string

    @IsString()
    description: string
}

export class CreatePlanDto {
    @IsOptional()
    @IsString()
    highlight: string

    @IsString()
    title: string

    @IsString()
    description: string

    @IsNumber()
    @Min(0)
    pricePerDev: number

    @IsNumber()
    @Min(0)
    tokenLimitPerDev: number

    @IsString()
    billingCycle: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateFeatureDto)
    @IsOptional()
    features?: CreateFeatureDto[]

    @IsBoolean()
    @IsOptional()
    isFree?: boolean

    @IsBoolean()
    @IsOptional()
    isActive?: boolean

    @IsBoolean()
    @IsOptional()
    isDefault?: boolean

    @IsBoolean()
    @IsOptional()
    isPublic?: boolean
}
