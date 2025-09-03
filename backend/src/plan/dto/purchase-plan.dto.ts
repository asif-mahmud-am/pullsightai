import { IsMongoId, IsNotEmpty } from 'class-validator'

export class PurchasePlanDto {
    @IsNotEmpty()
    @IsMongoId()
    planId: string

    @IsNotEmpty()
    noOfSeat: number

    @IsNotEmpty()
    gateway: string
}
