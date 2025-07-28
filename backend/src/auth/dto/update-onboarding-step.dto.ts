import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateOnboardingStepDto {
    @IsInt()
    @IsNotEmpty()
    onboardingStep: number

    @IsString()
    @IsOptional()
    currentWorkspace?: string
}
