import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SubscriptionPlanDocument = HydratedDocument<SubscriptionPlan>;

@Schema({ timestamps: true, collection: 'subscription_plans' })
export class SubscriptionPlan {
  @Prop({ required: true, unique: true, uppercase: true })
  code!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ default: 'USD' })
  currency!: string;

  @Prop({ default: 'month' })
  interval!: string;

  @Prop({ type: [String], default: [] })
  features!: string[];

  @Prop({ type: Object, default: {} })
  providerPriceIds!: Record<string, string>;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isOneOff!: boolean;
}

export const SubscriptionPlanSchema =
  SchemaFactory.createForClass(SubscriptionPlan);
