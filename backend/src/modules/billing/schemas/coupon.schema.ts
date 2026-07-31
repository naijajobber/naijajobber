import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({ timestamps: true, collection: 'coupons' })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true })
  code!: string;

  @Prop({ type: Number, default: null })
  percentOff!: number | null;

  @Prop({ type: Number, default: null })
  amountOff!: number | null;

  @Prop({ type: Date, default: null })
  expiresAt!: Date | null;

  @Prop({ default: 100 })
  maxRedemptions!: number;

  @Prop({ default: 0 })
  redemptionCount!: number;

  @Prop({ default: true })
  isActive!: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
