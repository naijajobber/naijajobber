import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SavedJobDocument = HydratedDocument<SavedJob>;

@Schema({ timestamps: true, collection: 'saved_jobs' })
export class SavedJob {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Job', required: true, index: true })
  jobId!: Types.ObjectId;
}

export const SavedJobSchema = SchemaFactory.createForClass(SavedJob);
SavedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });
