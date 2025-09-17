import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'
import { PaymentStatus } from 'src/database/enums/status.enum'
import { BillingCycle } from 'src/database/schemas/plan.schema'

export type PurchasedPlanDocument = PurchasedPlan & Document

export enum Status {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    CANCELED = 'canceled',
    PENDING = 'pending',
    RENEWED = 'renewed',
    UPGRADED = 'upgraded',
    DOWNGRADED = 'downgraded'
}

@Schema({ timestamps: true, versionKey: false })
export class PurchasedPlan {
    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: 'Workspace',
        set: (value) =>
            value instanceof Types.ObjectId
                ? value
                : Types.ObjectId.createFromHexString(value)
    })
    workspace: Types.ObjectId

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: 'Plan',
        set: (value) =>
            value instanceof Types.ObjectId
                ? value
                : Types.ObjectId.createFromHexString(value)
    })
    plan: Types.ObjectId

    @Prop({ required: true, min: 0 })
    amount: number

    @Prop({ required: false, min: 0 })
    gatewayCharge: number

    @Prop({ required: true, min: 0 })
    totalToken: number

    @Prop({ required: true, min: 0 })
    numOfSeat: number

    @Prop({ required: true, default: BillingCycle.MONTHLY })
    billingCycle: BillingCycle

    @Prop({ default: Status.PENDING, enum: Status })
    status: Status

    @Prop({ required: false })
    subscriptionId: string

    @Prop({
        required: true,
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    paymentStatus: string

    @Prop({ required: false })
    periodStart: Date

    @Prop({ required: false })
    periodEnd: Date

    @Prop({ required: false })
    title: string

    @Prop({ required: false })
    pricePerDev: number

    @Prop({ required: false })
    tokenLimitPerDev: number

    @Prop({ default: false })
    isFree: boolean

    @Prop({ default: false })
    isDefault: boolean
}

const schema = SchemaFactory.createForClass(PurchasedPlan)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const PurchasedPlanSchema = schema
