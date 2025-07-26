import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'

export type UserDocument = User & Document

@Schema({ timestamps: true, versionKey: false })
export class User {
    @Prop({ required: true, trim: true })
    provider: string

    @Prop({ required: true, trim: true })
    providerId: string

    @Prop({ required: false, trim: true })
    username?: string

    @Prop({ required: false, trim: true })
    displayName?: string

    @Prop({ required: false, trim: true, lowercase: true })
    email?: string

    @Prop({ required: false })
    avatarUrl?: string

    @Prop({ required: false })
    accessToken?: string

    @Prop({ required: false })
    refreshToken?: string

    @Prop({ required: false })
    raw?: string
}

const schema = SchemaFactory.createForClass(User)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const UserSchema = schema
