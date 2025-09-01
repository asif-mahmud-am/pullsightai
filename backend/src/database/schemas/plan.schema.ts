import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'

export type PlanDocument = Plan & Document

class Feature {
    @Prop({ required: true })
    title: string

    @Prop({ required: true })
    description: string
}

@Schema({ timestamps: true, versionKey: false })
export class Plan {
    @Prop({ required: true })
    highlight: string

    @Prop({ required: true, unique: true })
    title: string

    @Prop({ required: true })
    description: string

    @Prop({ required: true, min: 0 })
    pricePerDev: number

    @Prop({ required: true, min: 0 })
    tokenLimitPerDev: number

    @Prop({ required: true, min: 1 })
    noOfDays: number

    @Prop({ type: [Feature], default: [] })
    features: Feature[]

    @Prop({ default: false })
    isFree: boolean

    @Prop({ default: true })
    isActive: boolean

    @Prop({ default: false })
    isDefault: boolean

    @Prop({ default: true })
    isPublic: boolean
}

const schema = SchemaFactory.createForClass(Plan)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const PlanSchema = schema
