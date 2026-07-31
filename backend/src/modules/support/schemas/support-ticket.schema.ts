import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SupportTicketDocument = HydratedDocument<SupportTicket>;

@Schema({ timestamps: true, collection: 'support_tickets' })
export class SupportTicket {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Company', default: null })
  companyId!: Types.ObjectId | null;

  @Prop({ required: true, trim: true })
  subject!: string;

  @Prop({ trim: true, default: 'General' })
  category!: string;

  @Prop({ trim: true, default: '' })
  body!: string;

  @Prop({
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'OPEN',
  })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedAgentId!: Types.ObjectId | null;

  @Prop({
    type: [
      {
        note: { type: String },
        byUserId: { type: Types.ObjectId, ref: 'User' },
        at: { type: Date, default: () => new Date() },
        internal: { type: Boolean, default: true },
      },
    ],
    default: [],
  })
  notes!: Array<{
    note: string;
    byUserId: Types.ObjectId;
    at: Date;
    internal: boolean;
  }>;
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);
