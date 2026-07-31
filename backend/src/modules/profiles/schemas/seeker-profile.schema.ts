import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SeekerProfileDocument = HydratedDocument<SeekerProfile>;

export type ProfileVisibility = 'PRIVATE' | 'EMPLOYERS' | 'PUBLIC';

@Schema({ _id: false })
export class ExperienceItem {
  @Prop({ default: '' })
  title!: string;

  @Prop({ default: '' })
  company!: string;

  @Prop({ default: '' })
  employmentType!: string;

  @Prop({ default: '' })
  location!: string;

  @Prop({ default: '' })
  startDate!: string;

  @Prop({ default: '' })
  endDate!: string;

  @Prop({ default: false })
  currentlyWorking!: boolean;

  @Prop({ default: '' })
  description!: string;

  @Prop({ default: '' })
  achievements!: string;

  @Prop({ type: [String], default: [] })
  technologies!: string[];
}

@Schema({ _id: false })
export class EducationItem {
  @Prop({ default: '' })
  school!: string;

  @Prop({ default: '' })
  degree!: string;

  @Prop({ default: '' })
  field!: string;

  @Prop({ default: '' })
  grade!: string;

  @Prop({ default: '' })
  year!: string;

  @Prop({ default: '' })
  startDate!: string;

  @Prop({ default: '' })
  endDate!: string;

  @Prop({ default: '' })
  achievements!: string;
}

@Schema({ _id: false })
export class LanguageItem {
  @Prop({ default: '' })
  language!: string;

  @Prop({ default: '' })
  speaking!: string;

  @Prop({ default: '' })
  writing!: string;

  @Prop({ default: '' })
  reading!: string;

  @Prop({ default: '' })
  listening!: string;
}

@Schema({ _id: false })
export class CertificateItem {
  @Prop({ default: '' })
  name!: string;

  @Prop({ default: '' })
  organization!: string;

  @Prop({ default: '' })
  issueDate!: string;

  @Prop({ default: '' })
  expiryDate!: string;

  @Prop({ default: '' })
  credentialUrl!: string;

  @Prop({ default: '' })
  credentialId!: string;

  @Prop({ default: '' })
  fileUrl!: string;
}

@Schema({ _id: false })
export class SkillItem {
  @Prop({ default: '' })
  name!: string;

  @Prop({ default: 'General' })
  category!: string;

  @Prop({ default: 'Intermediate' })
  level!: string;
}

@Schema({ _id: false })
export class CvFileItem {
  @Prop({ required: true })
  url!: string;

  @Prop({ default: '' })
  name!: string;

  @Prop({ default: '' })
  mime!: string;

  @Prop({ default: 1 })
  version!: number;

  @Prop({ default: false })
  isDefault!: boolean;

  @Prop({ type: Date, default: () => new Date() })
  uploadedAt!: Date;
}

@Schema({ _id: false })
export class CareerGoals {
  @Prop({ default: '' })
  desiredRole!: string;

  @Prop({ default: '' })
  targetSalary!: string;

  @Prop({ type: [String], default: [] })
  preferredCountries!: string[];

  @Prop({ type: [String], default: [] })
  preferredCompanies!: string[];

  @Prop({ type: [String], default: [] })
  industries!: string[];

  @Prop({ default: '' })
  careerObjectives!: string;

  @Prop({ default: '' })
  learningGoals!: string;
}

@Schema({ timestamps: true, collection: 'seeker_profiles' })
export class SeekerProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  /** Legacy string skills; prefer skillItems when present */
  @Prop({ type: [String], default: [] })
  skills!: string[];

  @Prop({ type: [SkillItem], default: [] })
  skillItems!: SkillItem[];

  @Prop({ type: [ExperienceItem], default: [] })
  experience!: ExperienceItem[];

  @Prop({ type: [EducationItem], default: [] })
  education!: EducationItem[];

  @Prop({ type: [LanguageItem], default: [] })
  languages!: LanguageItem[];

  @Prop({ type: [CertificateItem], default: [] })
  certificates!: CertificateItem[];

  @Prop({ type: [String], default: [] })
  portfolioLinks!: string[];

  @Prop({ type: [String], default: [] })
  portfolioScreenshots!: string[];

  @Prop({
    type: String,
    enum: ['PRIVATE', 'EMPLOYERS', 'PUBLIC'],
    default: 'PRIVATE',
  })
  visibility!: ProfileVisibility;

  @Prop({ type: Object, default: {} })
  cvJson!: Record<string, unknown>;

  @Prop({ default: '' })
  cvPdfUrl!: string;

  @Prop({ type: [CvFileItem], default: [] })
  cvFiles!: CvFileItem[];

  @Prop({ default: '' })
  employmentStatus!: string;

  @Prop({ type: Number, default: null })
  yearsOfExperience!: number | null;

  @Prop({ default: '' })
  preferredSalary!: string;

  @Prop({ default: '' })
  preferredJobType!: string;

  @Prop({ default: '' })
  preferredTimezone!: string;

  @Prop({ default: '' })
  preferredCountry!: string;

  @Prop({ default: '' })
  preferredIndustry!: string;

  @Prop({ default: '' })
  currentJobTitle!: string;

  @Prop({
    type: String,
    enum: [
      '',
      'AVAILABLE_IMMEDIATELY',
      'OPEN_TO_WORK',
      'NOT_LOOKING',
      'AVAILABLE_NEXT_MONTH',
    ],
    default: '',
  })
  availabilityStatus!: string;

  @Prop({ type: CareerGoals, default: () => ({}) })
  careerGoals!: CareerGoals;

  @Prop({ type: [String], default: [] })
  learningBookmarks!: string[];

  @Prop({
    type: Object,
    default: () => ({
      enabled: false,
      keywords: [] as string[],
      frequency: 'weekly',
      country: '',
      salaryMin: '',
      workplaceTypes: [] as string[],
      industry: '',
      category: '',
      experience: '',
    }),
  })
  jobAlertPrefs!: {
    enabled: boolean;
    keywords: string[];
    frequency: string;
    country?: string;
    salaryMin?: string;
    workplaceTypes?: string[];
    industry?: string;
    category?: string;
    experience?: string;
  };

  @Prop({ type: Number, default: 0 })
  profileViews!: number;

  @Prop({ type: Number, default: 0 })
  resumeDownloads!: number;
}

export const SeekerProfileSchema = SchemaFactory.createForClass(SeekerProfile);
