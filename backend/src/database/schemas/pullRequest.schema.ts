import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'

export type PullRequestDocument = PullRequest & Document

@Schema({ timestamps: false, versionKey: false, id: false })
export class PRFile {
    @Prop({ required: true })
    prFileName: string

    @Prop({ required: true })
    prFileStatus: string

    @Prop({ default: 0 })
    prFileAdditions: number

    @Prop({ default: 0 })
    prFileDeletions: number

    @Prop({ default: 0 })
    prFileChanges: number

    @Prop({ type: String })
    prFileContentBefore: string

    @Prop({ type: String })
    prFileContentAfter: string

    @Prop({ type: String })
    prFileDiff: string

    @Prop({ type: String })
    prFileBlobUrl: string
}

@Schema({ timestamps: true, versionKey: false })
export class PullRequest {
    @Prop({ required: true })
    prId: string

    @Prop({ required: true })
    prUser: string

    @Prop({ required: true })
    owner: string

    @Prop({ required: true })
    repo: string

    @Prop({ required: true })
    prNumber: string

    @Prop({ type: String })
    installationId: string

    @Prop({ required: true })
    prRepoName: string

    @Prop({ required: true })
    prTitle: string

    @Prop({ type: String })
    prBody: string

    @Prop({ required: true })
    prState: string

    @Prop({ type: String })
    prCreatedAt: string

    @Prop({ type: String })
    prUpdatedAt: string

    @Prop({ required: true })
    prHeadBranch: string

    @Prop({ required: true })
    prBaseBranch: string

    @Prop({ required: true })
    prHeadSha: string

    @Prop({ required: true })
    prBaseSha: string

    @Prop({ default: 0 })
    prFilesChanged: number

    @Prop({ type: [PRFile], default: [] })
    prFiles: PRFile[]
}

const schema = SchemaFactory.createForClass(PullRequest)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const PullRequestSchema = schema
