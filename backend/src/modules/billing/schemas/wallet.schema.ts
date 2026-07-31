import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({ timestamps: true, collection: 'wallets' })
export class Wallet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ default: 0 })
  balance!: number;

  @Prop({ default: 0 })
  pendingBalance!: number;

  @Prop({ default: 'USD' })
  currency!: string;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
