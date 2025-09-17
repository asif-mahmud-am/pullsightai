import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'

export type PurchasedPackDocument = PurchasedPack & Document

@Schema({ timestamps: true, versionKey: false })
export class PurchasedPack {
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
        ref: 'Pack',
        set: (value) =>
            value instanceof Types.ObjectId
                ? value
                : Types.ObjectId.createFromHexString(value)
    })
    pack: Types.ObjectId

    @Prop({ required: true, min: 0 })
    amount: number

    @Prop({ required: false, min: 0, default: 0 })
    gatewayCharge: number

    @Prop({ required: true, min: 0 })
    totalToken: number

    @Prop({ default: false })
    isActive: boolean

    @Prop({ required: true })
    title: string
}

const schema = SchemaFactory.createForClass(PurchasedPack)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const PurchasedPackSchema = schema
