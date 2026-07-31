import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefundRequestDocument = HydratedDocument<RefundRequest>;

@Schema({ timestamps: true, collection: 'refund_requests' })
export class RefundRequest {
  @Prop({ type: Types.ObjectId, ref: 'Transaction', required: true })
  transactionId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  reason!: string;

  @Prop({ default: 'PENDING' })
  status!: string;
}

export const RefundRequestSchema = SchemaFactory.createForClass(RefundRequest);
