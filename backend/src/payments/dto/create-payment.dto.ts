import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator'
import { Types } from 'mongoose'
import { PaymentStatus } from 'src/database/enums/status.enum'
import { Service, ServiceBookingRef } from 'src/database/enums/transaction.enum'

export class CreatePaymentDto {
    @IsMongoId()
    @IsNotEmpty()
    serviceId: Types.ObjectId

    @IsNotEmpty()
    @IsEnum(Service)
    service: string

    @IsMongoId()
    @IsNotEmpty()
    serviceBookingId: Types.ObjectId

    @IsNotEmpty()
    @IsEnum(ServiceBookingRef)
    serviceBookingRef: string

    @IsNotEmpty()
    @IsMongoId()
    workspace: Types.ObjectId

    @IsNotEmpty()
    customerId: string

    @IsNotEmpty()
    price: number

    @IsOptional()
    noOfSeat: number = 1

    @IsOptional()
    discount?: number = 0

    @IsOptional()
    currency?: string = 'usd'

    @IsOptional()
    gateway?: string = 'stripe'

    @IsOptional()
    productId?: string

    @IsOptional()
    subscriptionId?: string

    @IsOptional()
    productTitle?: string
}

export class PaymentCallbackDto {
    @IsNotEmpty()
    transactionId: string

    @IsNotEmpty()
    @IsEnum(PaymentStatus)
    paymentStatus: string

    @IsNotEmpty()
    response: any

    @IsOptional()
    subscriptionId?: string
}
