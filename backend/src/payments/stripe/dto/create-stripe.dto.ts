import { IsNotEmpty, IsOptional } from 'class-validator'

export class CreateStripeDto {
    @IsNotEmpty()
    amount: number

    @IsOptional()
    currency: string = 'usd'

    @IsOptional()
    product: string = 'Course'
}
