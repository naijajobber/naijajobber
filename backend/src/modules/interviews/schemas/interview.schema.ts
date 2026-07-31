import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { InterviewStatus } from '../../../common/enums/domain.enum';

export type InterviewDocument = HydratedDocument<Interview>;

@Schema({
  timestamps: true,
  collection: 'interviews',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Interview {
  @Prop({ type: Types.ObjectId, ref: 'Job', required: true, index: true })
  jobId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Application', required: true, index: true })
  applicationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  seekerUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  employerUserId!: Types.ObjectId;

  @Prop({ type: Date, required: true })
  scheduledAt!: Date;

  @Prop({ default: 'UTC' })
  timezone!: string;

  @Prop({ default: '' })
  meetingLink!: string;

  @Prop({ default: '' })
  recruiterName!: string;

  @Prop({
    type: String,
    enum: InterviewStatus,
    default: InterviewStatus.SCHEDULED,
    index: true,
  })
  status!: InterviewStatus;

  @Prop({ default: '' })
  notes!: string;

  @Prop({
    type: String,
    enum: [
      'PHONE_SCREEN',
      'TECHNICAL',
      'BEHAVIORAL',
      'PANEL',
      'FINAL',
      'OTHER',
    ],
    default: 'OTHER',
  })
  interviewType!: string;

  @Prop({ type: [String], default: [] })
  panelists!: string[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);
InterviewSchema.index({ seekerUserId: 1, scheduledAt: -1 });
InterviewSchema.index({ employerUserId: 1, scheduledAt: -1 });
