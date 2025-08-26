import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'

export type WorkspaceWebhookDocument = WorkspaceWebhook & Document

@Schema({ timestamps: true, versionKey: false })
export class WorkspaceWebhook {
    @Prop({ required: true, trim: true })
    workspaceSlug: string

    @Prop({ required: true, trim: true })
    provider: string

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: 'Repository',
        set: (value) =>
            Types.ObjectId.isValid(value)
                ? value
                : Types.ObjectId.createFromHexString(value)
    })
    repository?: Types.ObjectId

    @Prop({ required: true, trim: true })
    workspaceRepoSlug: string

    @Prop({ required: true, trim: true })
    workspaceWebhookId: string

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: 'Workspace',
        set: (value) =>
            Types.ObjectId.isValid(value)
                ? value
                : Types.ObjectId.createFromHexString(value)
    })
    workspace?: Types.ObjectId
}

const schema = SchemaFactory.createForClass(WorkspaceWebhook)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const WorkspaceWebhookSchema = schema
