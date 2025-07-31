import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'

export type WorkspaceDocument = Workspace & Document

@Schema({ timestamps: true, versionKey: false })
export class Workspace {
    @Prop({ required: true, trim: true })
    id: string

    @Prop({ required: true, trim: true })
    name: string

    @Prop({ required: true, trim: true })
    url: string

    @Prop({ required: true, trim: true })
    reposUrl: string

    @Prop({ required: true, trim: true })
    avatarUrl: string

    @Prop({ required: true, trim: true })
    type: string

    @Prop({ required: true, trim: true })
    nodeId: string

    @Prop({ required: false })
    description?: string

    @Prop({ required: true, trim: true })
    installationId?: string
}

const schema = SchemaFactory.createForClass(Workspace)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const WorkspaceSchema = schema
