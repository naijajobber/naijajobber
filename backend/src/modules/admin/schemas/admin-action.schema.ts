import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AdminActionDocument = HydratedDocument<AdminAction>;

@Schema({ timestamps: true, collection: 'admin_actions' })
export class AdminAction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  actorId!: Types.ObjectId;

  @Prop({ required: true })
  action!: string;

  @Prop({ required: true })
  targetType!: string;

  @Prop({ default: '' })
  targetId!: string;

  @Prop({ type: Object, default: {} })
  meta!: Record<string, unknown>;

  createdAt!: Date;
}

export const AdminActionSchema = SchemaFactory.createForClass(AdminAction);
