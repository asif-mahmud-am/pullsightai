import { IsBoolean, IsOptional } from 'class-validator'

export class UpdateRepositoryDto {
    @IsOptional()
    @IsBoolean()
    isActive: boolean
}
