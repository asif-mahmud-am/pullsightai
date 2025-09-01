import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CreatePackDto {
    @IsString()
    title: string

    @IsString()
    description: string

    @IsNumber()
    @Min(0)
    price: number

    @IsNumber()
    @Min(0)
    token: number

    @IsBoolean()
    @IsOptional()
    isActive?: boolean

    @IsBoolean()
    @IsOptional()
    isPublic?: boolean
}
