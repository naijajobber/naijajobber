import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearningController } from './controllers/learning.controller';
import {
  LearningItem,
  LearningItemSchema,
} from './schemas/learning-item.schema';
import { LearningService } from './services/learning.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LearningItem.name, schema: LearningItemSchema },
    ]),
  ],
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
