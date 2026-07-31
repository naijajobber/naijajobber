import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LearningItemType } from '../../../common/enums/domain.enum';

export type LearningItemDocument = HydratedDocument<LearningItem>;

@Schema({
  timestamps: true,
  collection: 'learning_items',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class LearningItem {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({
    type: String,
    enum: LearningItemType,
    default: LearningItemType.ARTICLE,
    index: true,
  })
  type!: LearningItemType;

  @Prop({ required: true })
  body!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const LearningItemSchema = SchemaFactory.createForClass(LearningItem);
