import { Type } from 'class-transformer'
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator'
import { Types } from 'mongoose'
import { RepositoryDto } from './make-subscription.dto'

export class CreateRepositoryDto {

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RepositoryDto)
    repositories: RepositoryDto[]
}
