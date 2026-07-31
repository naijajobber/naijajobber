import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApplicationStatus } from '../../../common/enums/domain.enum';

export type ApplicationDocument = HydratedDocument<Application>;

@Schema({ _id: false })
export class ApplicationTimelineNote {
  @Prop({ required: true })
  status!: string;

  @Prop({ trim: true, default: '' })
  note!: string;

  @Prop({ type: Date, default: Date.now })
  at!: Date;
}

@Schema({
  timestamps: true,
  collection: 'applications',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Application {
  @Prop({ type: Types.ObjectId, ref: 'Job', required: true, index: true })
  jobId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  applicantUserId!: Types.ObjectId;

  @Prop({ trim: true, default: '' })
  coverLetter!: string;

  @Prop({ trim: true, default: '' })
  resumeUrl!: string;

  @Prop({
    type: String,
    enum: ApplicationStatus,
    default: ApplicationStatus.SUBMITTED,
    index: true,
  })
  status!: ApplicationStatus;

  @Prop({ type: [ApplicationTimelineNote], default: [] })
  timeline!: ApplicationTimelineNote[];

  @Prop({ trim: true, default: '' })
  employerNotes!: string;

  @Prop({ trim: true, default: '' })
  expectedSalary!: string;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
ApplicationSchema.index(
  { jobId: 1, applicantUserId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
