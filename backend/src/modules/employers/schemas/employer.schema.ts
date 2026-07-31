import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  CompanyRole,
  InviteStatus,
} from '../../../common/enums/domain.enum';

export type EmployerDocument = HydratedDocument<Employer>;

@Schema({
  timestamps: true,
  collection: 'employers',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Employer {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Company', default: null, index: true })
  companyId!: Types.ObjectId | null;

  @Prop({ trim: true, default: 'Recruiter' })
  title!: string;

  @Prop({
    type: String,
    enum: CompanyRole,
    default: CompanyRole.OWNER,
  })
  companyRole!: CompanyRole;

  @Prop({
    type: String,
    enum: InviteStatus,
    default: InviteStatus.ACTIVE,
  })
  inviteStatus!: InviteStatus;

  @Prop({ trim: true, lowercase: true, default: '' })
  inviteEmail!: string;

  @Prop({ default: true })
  isPrimary!: boolean;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const EmployerSchema = SchemaFactory.createForClass(Employer);
