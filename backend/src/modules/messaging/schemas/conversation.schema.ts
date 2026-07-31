import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({
  timestamps: true,
  collection: 'conversations',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Conversation {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  participantIds!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Job', default: null, index: true })
  jobId!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Application', default: null, index: true })
  applicationId!: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  lastMessageAt!: Date | null;

  @Prop({ trim: true, default: '' })
  lastMessagePreview!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ participantIds: 1 });
