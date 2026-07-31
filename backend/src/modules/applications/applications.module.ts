import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployersModule } from '../employers/employers.module';
import { InterviewsModule } from '../interviews/interviews.module';
import { JobsModule } from '../jobs/jobs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { UsersModule } from '../users/users.module';
import { ApplicationsController } from './controllers/applications.controller';
import { ApplicationsRepository } from './repositories/applications.repository';
import {
  Application,
  ApplicationSchema,
} from './schemas/application.schema';
import { ApplicationsService } from './services/applications.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
    ]),
    JobsModule,
    EmployersModule,
    NotificationsModule,
    ProfilesModule,
    InterviewsModule,
    UsersModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, ApplicationsRepository],
  exports: [ApplicationsService, ApplicationsRepository],
})
export class ApplicationsModule {}
