import { IsInt, IsOptional, IsString } from 'class-validator'

export class UpdateOnboardingStepDto {
    @IsInt()
    @IsOptional()
    onboardingStep: number

    @IsString()
    @IsOptional()
    currentWorkspace?: string
}
