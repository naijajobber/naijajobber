import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PlatformSettingsDocument = HydratedDocument<PlatformSettings>;

@Schema({ _id: false })
export class PlatformApiKey {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  keyHash!: string;

  @Prop({ required: true })
  keyPrefix!: string;

  @Prop({ type: Date, default: () => new Date() })
  createdAt!: Date;

  @Prop({ type: Date, default: null })
  revokedAt!: Date | null;
}
export const PlatformApiKeySchema =
  SchemaFactory.createForClass(PlatformApiKey);

@Schema({ timestamps: true, collection: 'platform_settings' })
export class PlatformSettings {
  @Prop({ default: 'default', unique: true })
  key!: string;

  @Prop({ default: 'NaijaJobber' })
  platformName!: string;

  @Prop({ trim: true, default: '' })
  logoUrl!: string;

  @Prop({ trim: true, default: '#0F766E' })
  primaryColor!: string;

  @Prop({ trim: true, default: '#F97316' })
  accentColor!: string;

  @Prop({ default: false })
  maintenanceMode!: boolean;

  @Prop({
    type: Object,
    default: () => ({ jobModerationRequired: false }),
  })
  featureFlags!: Record<string, boolean>;

  @Prop({
    type: Object,
    default: () => ({ defaultLocale: 'en', defaultCurrency: 'USD' }),
  })
  localization!: Record<string, string>;

  @Prop({
    type: Object,
    default: () => ({ passwordMinLength: 8, jwtTtlDays: 7 }),
  })
  security!: Record<string, number>;

  @Prop({ type: [String], default: [] })
  blockedIps!: string[];

  @Prop({ type: Object, default: () => ({}) })
  aiPrompts!: Record<string, string>;

  @Prop({ type: [PlatformApiKeySchema], default: [] })
  apiKeys!: PlatformApiKey[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const PlatformSettingsSchema =
  SchemaFactory.createForClass(PlatformSettings);
