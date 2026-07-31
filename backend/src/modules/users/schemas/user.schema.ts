import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../../../common/enums/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  collection: 'users',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.password;
      delete ret.refreshTokenHash;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.__v;
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ type: String, enum: Role, default: Role.JOB_SEEKER })
  role!: Role;

  @Prop({ default: false })
  isEmailVerified!: boolean;

  @Prop({ type: String, default: null })
  emailVerificationToken!: string | null;

  @Prop({ type: Date, default: null })
  emailVerificationExpires!: Date | null;

  @Prop({ type: String, default: null })
  passwordResetToken!: string | null;

  @Prop({ type: Date, default: null })
  passwordResetExpires!: Date | null;

  @Prop({ type: String, default: null })
  refreshTokenHash!: string | null;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;

  @Prop({ trim: true, default: '' })
  phone!: string;

  @Prop({ trim: true, default: '' })
  headline!: string;

  @Prop({ trim: true, default: '' })
  bio!: string;

  @Prop({ trim: true, default: '' })
  location!: string;

  @Prop({ trim: true, default: '' })
  avatarUrl!: string;

  @Prop({ trim: true, default: '' })
  address!: string;

  @Prop({ trim: true, default: '' })
  country!: string;

  @Prop({ trim: true, default: '' })
  nationality!: string;

  @Prop({ trim: true, default: '' })
  referralCode!: string;

  @Prop({ type: String, default: null })
  referredBy!: string | null;

  @Prop({ type: Number, default: 0 })
  referralClicks!: number;

  @Prop({ type: Number, default: 0 })
  referralRegistrations!: number;

  @Prop({ type: Number, default: 0 })
  referralEarnings!: number;

  @Prop({ type: String, default: null })
  oauthProvider!: string | null;

  @Prop({ type: String, default: null, index: true })
  oauthId!: string | null;

  @Prop({ type: Date, default: null, index: true })
  lastLoginAt!: Date | null;

  @Prop({ trim: true, default: '' })
  gender!: string;

  @Prop({ type: Date, default: null })
  dateOfBirth!: Date | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
