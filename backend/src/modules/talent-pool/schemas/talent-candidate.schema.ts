import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TalentCandidateDocument = HydratedDocument<TalentCandidate>;

@Schema({ timestamps: true, collection: 'talent_candidates' })
export class TalentCandidate {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  seekerUserId!: Types.ObjectId;

  @Prop({ trim: true, default: 'Engineering' })
  folder!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ trim: true, default: '' })
  notes!: string;

  @Prop({ type: Number, default: 3 })
  rating!: number;
}

export const TalentCandidateSchema =
  SchemaFactory.createForClass(TalentCandidate);
