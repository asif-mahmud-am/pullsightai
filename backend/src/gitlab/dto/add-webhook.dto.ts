import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator'

export class AddWebhookDto {
    @IsString()
    access_token: string

    @IsString()
    project_id: string

    @IsOptional()
    @IsUrl()
    webhook_url?: string

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    events?: string[]
}
