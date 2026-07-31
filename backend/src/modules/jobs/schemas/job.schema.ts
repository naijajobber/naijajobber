import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  EmploymentType,
  ExperienceLevel,
  JobStatus,
  WorkplaceType,
} from '../../../common/enums/domain.enum';

export type JobDocument = HydratedDocument<Job>;

@Schema({
  timestamps: true,
  collection: 'jobs',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Job {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  postedByUserId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  slug!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({
    type: String,
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
  })
  employmentType!: EmploymentType;

  @Prop({ type: String, enum: WorkplaceType, default: WorkplaceType.REMOTE })
  workplaceType!: WorkplaceType;

  @Prop({ trim: true, default: 'Worldwide' })
  location!: string;

  @Prop({ trim: true, default: 'UTC' })
  timezone!: string;

  @Prop({ type: Number, default: null })
  salaryMin!: number | null;

  @Prop({ type: Number, default: null })
  salaryMax!: number | null;

  @Prop({ trim: true, default: 'USD' })
  salaryCurrency!: string;

  @Prop({ type: String, enum: ExperienceLevel, default: ExperienceLevel.MID })
  experienceLevel!: ExperienceLevel;

  @Prop({ type: [String], default: [] })
  skills!: string[];

  @Prop({ trim: true, default: 'Software Engineering', index: true })
  category!: string;

  @Prop({
    type: String,
    enum: JobStatus,
    default: JobStatus.DRAFT,
    index: true,
  })
  status!: JobStatus;

  @Prop({ default: false, index: true })
  isFeatured!: boolean;

  @Prop({ default: false })
  isUrgent!: boolean;

  @Prop({ default: true })
  easyApply!: boolean;

  @Prop({ trim: true, default: '' })
  externalApplyUrl!: string;

  @Prop({ trim: true, default: '' })
  department!: string;

  @Prop({ trim: true, default: '' })
  country!: string;

  @Prop({ type: Number, default: 1 })
  openings!: number;

  @Prop({ type: [String], default: [] })
  preferredSkills!: string[];

  @Prop({ trim: true, default: '' })
  responsibilities!: string;

  @Prop({ trim: true, default: '' })
  requirements!: string;

  @Prop({ trim: true, default: '' })
  benefits!: string;

  @Prop({ trim: true, default: '' })
  hiringProcess!: string;

  @Prop({ type: Date, default: null })
  deadline!: Date | null;

  @Prop({
    type: [
      {
        id: { type: String },
        prompt: { type: String },
        type: { type: String, default: 'text' },
      },
    ],
    default: [],
  })
  screeningQuestions!: Array<{ id: string; prompt: string; type: string }>;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: Date, default: null })
  scheduledPublishAt!: Date | null;

  @Prop({ default: false })
  paused!: boolean;

  @Prop({ default: false })
  archived!: boolean;

  @Prop({ default: false })
  flagged!: boolean;

  @Prop({ trim: true, default: '' })
  flagReason!: string;

  @Prop({ default: false })
  isSponsored!: boolean;

  @Prop({ type: Date, default: null })
  featuredUntil!: Date | null;

  @Prop({ type: Number, default: 0 })
  sponsorBudget!: number;

  @Prop({ type: Number, default: 0 })
  views!: number;

  @Prop({ type: Number, default: 0 })
  bookmarks!: number;

  @Prop({ type: Number, default: 0 })
  shares!: number;

  @Prop({ type: Number, default: 0 })
  impressions!: number;

  @Prop({ type: Number, default: 0 })
  clicks!: number;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;

  @Prop({ type: Date, default: null })
  publishedAt!: Date | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
JobSchema.index({ title: 'text', description: 'text', skills: 'text' });
