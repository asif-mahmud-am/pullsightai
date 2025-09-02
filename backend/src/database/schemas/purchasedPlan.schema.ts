import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'
import { BillingCycle } from 'src/database/schemas/plan.schema'

export type PurchasedPlanDocument = PurchasedPlan & Document

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

    @Prop({ required: true, min: 0 })
    gatewayCharge: number

    @Prop({ required: true, min: 0 })
    totalToken: number

    @Prop({ required: true, min: 0 })
    remainingToken: number

    @Prop({ required: true, min: 0 })
    numOfSeat: number

    @Prop({ required: true, default: BillingCycle.MONTHLY })
    billingCycle: BillingCycle

    @Prop({ default: true })
    isActive: boolean
}

const schema = SchemaFactory.createForClass(PurchasedPlan)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const PurchasedPlanSchema = schema
