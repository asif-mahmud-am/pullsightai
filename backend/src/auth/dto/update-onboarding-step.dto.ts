import { IsInt, IsNotEmpty } from 'class-validator'

export class UpdateOnboardingStepDto {
    @IsInt()
    @IsNotEmpty()
    onboardingStep: number
}
