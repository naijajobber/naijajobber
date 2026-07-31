import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationPreferenceDocument =
  HydratedDocument<NotificationPreference>;

@Schema({
  timestamps: true,
  collection: 'notification_preferences',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class NotificationPreference {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ default: true })
  emailEnabled!: boolean;

  @Prop({ default: true })
  inAppEnabled!: boolean;

  @Prop({ default: false })
  pushEnabled!: boolean;

  @Prop({ default: false })
  smsEnabled!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const NotificationPreferenceSchema = SchemaFactory.createForClass(
  NotificationPreference,
);
