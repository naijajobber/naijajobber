import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AssessmentDocument = HydratedDocument<Assessment>;

@Schema({ timestamps: true, collection: 'assessments' })
export class Assessment {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true, default: 'ESSAY' })
  type!: string;

  @Prop({ type: [Object], default: [] })
  questions!: Array<Record<string, unknown>>;
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);

@Schema({ timestamps: true, collection: 'assessment_submissions' })
export class AssessmentSubmission {
  @Prop({ type: Types.ObjectId, ref: 'Assessment', required: true })
  assessmentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Application', required: true })
  applicationId!: Types.ObjectId;

  @Prop({ type: Number, default: null })
  score!: number | null;

  @Prop({ trim: true, default: 'PENDING' })
  status!: string;
}

export type AssessmentSubmissionDocument =
  HydratedDocument<AssessmentSubmission>;
export const AssessmentSubmissionSchema =
  SchemaFactory.createForClass(AssessmentSubmission);
