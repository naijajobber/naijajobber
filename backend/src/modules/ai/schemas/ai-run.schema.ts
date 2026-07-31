import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AiRunDocument = HydratedDocument<AiRun>;

export type AiRunType =
  | 'RESUME_REVIEW'
  | 'COVER_LETTER'
  | 'JOB_MATCH'
  | 'RESUME_PARSE'
  | 'CANDIDATE_MATCH';

@Schema({
  timestamps: true,
  collection: 'ai_runs',
})
export class AiRun {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: [
      'RESUME_REVIEW',
      'COVER_LETTER',
      'JOB_MATCH',
      'RESUME_PARSE',
      'CANDIDATE_MATCH',
    ],
    required: true,
  })
  type!: AiRunType;

  @Prop({ type: Object, default: {} })
  input!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  output!: Record<string, unknown>;

  @Prop({ default: '' })
  modelName!: string;

  @Prop({ default: 0 })
  tokensUsed!: number;

  @Prop({ default: 'SUCCESS' })
  status!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AiRunSchema = SchemaFactory.createForClass(AiRun);
AiRunSchema.index({ userId: 1, createdAt: -1 });
