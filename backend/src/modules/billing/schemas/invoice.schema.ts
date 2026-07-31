import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InvoiceDocument = HydratedDocument<Invoice>;

@Schema({ timestamps: true, collection: 'invoices' })
export class Invoice {
  @Prop({ required: true, unique: true })
  number!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Transaction', required: true })
  transactionId!: Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  lineItems!: Array<{ description: string; amount: number }>;

  @Prop({ required: true })
  total!: number;

  @Prop({ default: 'USD' })
  currency!: string;

  @Prop({ default: '' })
  pdfUrl!: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
