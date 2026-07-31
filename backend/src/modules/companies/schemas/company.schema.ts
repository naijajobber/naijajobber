import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CompanyVerificationStatus } from '../../../common/enums/domain.enum';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ _id: false })
export class SocialLinks {
  @Prop({ trim: true, default: '' })
  linkedin!: string;

  @Prop({ trim: true, default: '' })
  twitter!: string;

  @Prop({ trim: true, default: '' })
  facebook!: string;

  @Prop({ trim: true, default: '' })
  instagram!: string;

  @Prop({ trim: true, default: '' })
  youtube!: string;
}
export const SocialLinksSchema = SchemaFactory.createForClass(SocialLinks);

@Schema({ _id: false })
export class CompanyBranding {
  @Prop({ trim: true, default: '' })
  primaryColor!: string;

  @Prop({ trim: true, default: '' })
  accentColor!: string;

  @Prop({ trim: true, default: '' })
  fontFamily!: string;
}
export const CompanyBrandingSchema = SchemaFactory.createForClass(CompanyBranding);

@Schema({ _id: false })
export class VerificationDocument {
  @Prop({ required: true, trim: true })
  type!: string;

  @Prop({ required: true, trim: true })
  fileUrl!: string;

  @Prop({ type: Date, default: () => new Date() })
  uploadedAt!: Date;
}
export const VerificationDocumentSchema =
  SchemaFactory.createForClass(VerificationDocument);

@Schema({ _id: false })
export class CareerPage {
  @Prop({ trim: true, default: '' })
  story!: string;

  @Prop({ type: [String], default: [] })
  benefits!: string[];

  @Prop({ trim: true, default: '' })
  cultureBlurb!: string;

  @Prop({ trim: true, default: '' })
  seoTitle!: string;

  @Prop({ trim: true, default: '' })
  seoDescription!: string;
}
export const CareerPageSchema = SchemaFactory.createForClass(CareerPage);

@Schema()
export class ApiKeyEntry {
  @Prop({ required: true })
  keyHash!: string;

  @Prop({ trim: true, default: '' })
  label!: string;

  @Prop({ trim: true, default: '' })
  prefix!: string;

  @Prop({ type: Date, default: () => new Date() })
  createdAt!: Date;

  @Prop({ type: Date, default: null })
  lastUsedAt!: Date | null;

  @Prop({ type: Date, default: null })
  revokedAt!: Date | null;
}
export const ApiKeyEntrySchema = SchemaFactory.createForClass(ApiKeyEntry);

@Schema()
export class WebhookEntry {
  @Prop({ required: true, trim: true })
  url!: string;

  @Prop({ type: [String], default: [] })
  events!: string[];

  @Prop({ type: Date, default: () => new Date() })
  createdAt!: Date;
}
export const WebhookEntrySchema = SchemaFactory.createForClass(WebhookEntry);

@Schema({ _id: false })
export class CompanyIntegrations {
  @Prop({ default: false })
  googleCalendar!: boolean;

  @Prop({ default: false })
  outlook!: boolean;

  @Prop({ default: false })
  slack!: boolean;

  @Prop({ default: false })
  teams!: boolean;

  @Prop({ default: false })
  zoom!: boolean;

  @Prop({ default: false })
  meet!: boolean;

  @Prop({ default: false })
  linkedin!: boolean;

  @Prop({ default: false })
  github!: boolean;

  @Prop({ default: false })
  zapier!: boolean;
}
export const CompanyIntegrationsSchema =
  SchemaFactory.createForClass(CompanyIntegrations);

@Schema({
  timestamps: true,
  collection: 'companies',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Company {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug!: string;

  @Prop({ trim: true, default: '' })
  website!: string;

  @Prop({ trim: true, default: '' })
  logoUrl!: string;

  @Prop({ trim: true, default: '' })
  coverBannerUrl!: string;

  @Prop({ trim: true, default: '' })
  description!: string;

  @Prop({ trim: true, default: '' })
  size!: string;

  @Prop({ trim: true, default: '' })
  industry!: string;

  @Prop({ trim: true, default: '' })
  email!: string;

  @Prop({ trim: true, default: '' })
  phone!: string;

  @Prop({ trim: true, default: '' })
  headquarters!: string;

  @Prop({ type: [String], default: [] })
  officeLocations!: string[];

  @Prop({ type: Number, default: null })
  yearFounded!: number | null;

  @Prop({ trim: true, default: '' })
  mission!: string;

  @Prop({ trim: true, default: '' })
  vision!: string;

  @Prop({ type: [String], default: [] })
  coreValues!: string[];

  @Prop({ type: SocialLinksSchema, default: () => ({}) })
  socialLinks!: SocialLinks;

  @Prop({ type: [String], default: [] })
  culturePhotos!: string[];

  @Prop({ type: [String], default: [] })
  officeImages!: string[];

  @Prop({ type: [String], default: [] })
  videoUrls!: string[];

  @Prop({ type: CompanyBrandingSchema, default: () => ({}) })
  branding!: CompanyBranding;

  @Prop({
    type: String,
    enum: CompanyVerificationStatus,
    default: CompanyVerificationStatus.PENDING,
    index: true,
  })
  verificationStatus!: CompanyVerificationStatus;

  @Prop({ trim: true, default: '' })
  rejectionReason!: string;

  @Prop({ type: [VerificationDocumentSchema], default: [] })
  verificationDocuments!: VerificationDocument[];

  @Prop({
    type: [
      {
        note: { type: String },
        byUserId: { type: Types.ObjectId, ref: 'User' },
        at: { type: Date, default: () => new Date() },
      },
    ],
    default: [],
  })
  verificationNotes!: Array<{
    note: string;
    byUserId: Types.ObjectId;
    at: Date;
  }>;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedModeratorUserId!: Types.ObjectId | null;

  @Prop({ type: CareerPageSchema, default: () => ({}) })
  careerPage!: CareerPage;

  @Prop({ type: [ApiKeyEntrySchema], default: [] })
  apiKeys!: ApiKeyEntry[];

  @Prop({ type: [WebhookEntrySchema], default: [] })
  webhooks!: WebhookEntry[];

  @Prop({ type: CompanyIntegrationsSchema, default: () => ({}) })
  integrations!: CompanyIntegrations;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdByUserId!: Types.ObjectId;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
