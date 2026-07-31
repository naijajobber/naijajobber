import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true, collection: 'transactions' })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Company', default: null })
  companyId!: Types.ObjectId | null;

  @Prop({ required: true })
  amount!: number;

  @Prop({ default: 'USD' })
  currency!: string;

  @Prop({ default: 'mock' })
  provider!: string;

  @Prop({ required: true, unique: true, index: true })
  reference!: string;

  @Prop({ default: 'PENDING' })
  status!: string;

  @Prop({ required: true })
  purpose!: string;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
