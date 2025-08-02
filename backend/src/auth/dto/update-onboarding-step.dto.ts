import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateOnboardingStepDto {
    @IsInt()
    @IsOptional()
    onboardingStep: number

    @IsString()
    @IsNotEmpty()
    currentWorkspace?: string
}
