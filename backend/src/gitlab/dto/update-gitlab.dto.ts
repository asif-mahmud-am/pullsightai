import { PartialType } from '@nestjs/mapped-types';
import { CreateGitlabDto } from './create-gitlab.dto';

export class UpdateGitlabDto extends PartialType(CreateGitlabDto) {}
