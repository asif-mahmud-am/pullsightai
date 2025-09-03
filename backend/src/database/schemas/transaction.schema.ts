import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Types } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'
import { PaymentStatus } from 'src/database/enums/status.enum'
import {
    Gateway,
    Service,
    ServiceBookingRef
} from 'src/database/enums/transaction.enum'

export type TransactionDocument = Transaction & Document

@Schema({
    timestamps: true,
    versionKey: false
})
export class Transaction {
    @Prop({ type: Types.ObjectId, required: true, refPath: 'service' })
    serviceId: Types.ObjectId

    @Prop({
        required: true,
        enum: Service
    })
    service: string

    @Prop({
        type: Types.ObjectId,
        refPath: 'serviceBookingRef',
        required: true,
        enum: ServiceBookingRef
    })
    serviceBookingId: Types.ObjectId

    @Prop({ enum: ServiceBookingRef, required: true })
    serviceBookingRef: string

    @Prop({ required: true })
    amount: number

    @Prop({ required: true, default: 0 })
    discount: number

    @Prop({
        required: true,
        enum: PaymentStatus
    })
    paymentStatus: string

    @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
    workspace: Types.ObjectId

    @Prop({ required: true })
    storeAmount: number

    @Prop({ required: true, enum: Gateway, default: Gateway.STRIPE })
    gateway: string

    @Prop()
    method: string

    @Prop({ default: 0 })
    gatewayCommission: number

    @Prop({ required: true })
    transactionId: string

    @Prop({ required: false })
    subscriptionId: string

    @Prop({ required: true, default: 'usd' })
    currency: string

    @Prop({ type: mongoose.Schema.Types.Mixed, required: false })
    response?: any
}

const schema = SchemaFactory.createForClass(Transaction)
schema.plugin(uniqueValidator, { message: '{PATH} already exists!' })
schema.plugin(mongoosePaginate)
export const TransactionSchema = schema
