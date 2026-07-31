import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({ timestamps: true, collection: 'subscriptions' })
export class Subscription {
  @Prop({ type: Types.ObjectId, ref: 'Company', default: null, index: true })
  companyId!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  planCode!: string;

  @Prop({ default: 'ACTIVE' })
  status!: string;

  @Prop({ default: 'mock' })
  provider!: string;

  @Prop({ default: '' })
  providerSubscriptionId!: string;

  @Prop({ type: Date, default: null })
  currentPeriodEnd!: Date | null;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
