import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'

export type PullRequestAnalysisDocument = PullRequestAnalysis & Document

export interface Author {
    username: string
    avatarUrl: string
}
export enum Status {
    INPROGRESS = 'inprogress',
    COMPLETED = 'completed',
    FAILED = 'failed'
}
@Schema({ timestamps: true, versionKey: false })
export class PullRequestAnalysis {
    @Prop({ required: true, type: String })
    prId: string

    @Prop({ required: true, type: String })
    provider: string

    @Prop({ required: true, type: String })
    workspaceSlug: string

    @Prop({ required: true, type: String })
    repositorySlug: string

    @Prop({ required: true, type: String })
    prNumber: string

    @Prop({ nullable: true })
    installationId: string

    @Prop({ type: String, default: null })
    summary: string

    @Prop({ type: Object, default: null })
    modelInfo: any

    @Prop({ type: Object, default: null })
    usageInfo: any

    @Prop({ type: String, enum: Status, default: Status.INPROGRESS })
    status: Status

    @Prop({ type: Date, default: null })
    startedAt: Date

    @Prop({ type: Date, default: null })
    completedAt: Date
}

const schema = SchemaFactory.createForClass(PullRequestAnalysis)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const PullRequestAnalysisSchema = schema
