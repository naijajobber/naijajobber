import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Application,
  ApplicationSchema,
} from '../applications/schemas/application.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { InterviewsController } from './controllers/interviews.controller';
import { InterviewsRepository } from './repositories/interviews.repository';
import { Interview, InterviewSchema } from './schemas/interview.schema';
import { InterviewsService } from './services/interviews.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Interview.name, schema: InterviewSchema },
      { name: Application.name, schema: ApplicationSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [InterviewsController],
  providers: [InterviewsService, InterviewsRepository],
  exports: [InterviewsService],
})
export class InterviewsModule {}
