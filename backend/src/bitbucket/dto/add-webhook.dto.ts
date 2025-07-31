import { IsString, IsArray, IsOptional, IsUrl } from 'class-validator';

export class AddWebhookDto {
  @IsString()
  access_token: string;

  @IsString()
  repository: string;

  @IsString()
  workspace: string;

  @IsOptional()
  @IsUrl()
  webhook_url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  events?: string[];
}
