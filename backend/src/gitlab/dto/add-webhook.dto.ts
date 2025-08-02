import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator'

export class AddWebhookDto {
    @IsString()
    project_id: string

    @IsOptional()
    @IsUrl()
    webhookUrl?: string

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    events?: string[]
}
