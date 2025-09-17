import { IsMongoId, IsNotEmpty } from 'class-validator'

export class PurchasePlanDto {
    @IsNotEmpty()
    @IsMongoId()
    packId: string

    @IsNotEmpty()
    gateway: string
}
