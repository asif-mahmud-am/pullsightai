import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'

export type WorkspaceDocument = Workspace & Document

@Schema({ timestamps: true, versionKey: false })
export class Workspace {
    @Prop({ required: true, trim: true })
    id: string

    @Prop({ required: true, trim: true })
    name: string

    @Prop({ required: false, trim: true })
    slug?: string

    @Prop({ required: true, trim: true })
    provider: string

    @Prop({ required: true, trim: true })
    url: string

    @Prop({ required: true, trim: true })
    reposUrl: string

    @Prop({ required: true, trim: true })
    avatarUrl: string

    @Prop({ required: true, trim: true })
    type?: string

    @Prop({ required: true, trim: true })
    nodeId: string

    @Prop({ required: false })
    description?: string

    @Prop({ required: false, trim: true })
    installationId?: string

    @Prop({ required: false })
    isPrivate?: boolean

    @Prop({ required: false })
    createdOn?: string

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: 'User',
        set: (value) =>
            Types.ObjectId.isValid(value)
                ? value
                : Types.ObjectId.createFromHexString(value)
    })
    ownerId?: Types.ObjectId
}

const schema = SchemaFactory.createForClass(Workspace)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const WorkspaceSchema = schema
