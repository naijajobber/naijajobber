import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OfferDocument = HydratedDocument<Offer>;

@Schema({ timestamps: true, collection: 'offers' })
export class Offer {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Application', required: true, index: true })
  applicationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  seekerUserId!: Types.ObjectId;

  @Prop({ trim: true, default: '' })
  position!: string;

  @Prop({ trim: true, default: '' })
  salary!: string;

  @Prop({ trim: true, default: '' })
  benefits!: string;

  @Prop({ trim: true, default: '' })
  startDate!: string;

  @Prop({ trim: true, default: 'FULL_TIME' })
  employmentType!: string;

  @Prop({
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
    default: 'PENDING',
  })
  status!: string;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
