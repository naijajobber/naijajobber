import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Application,
  ApplicationSchema,
} from '../applications/schemas/application.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { JobsModule } from '../jobs/jobs.module';
import { UsersModule } from '../users/users.module';
import { ProfilesController } from './controllers/profiles.controller';
import { SavedJob, SavedJobSchema } from './schemas/saved-job.schema';
import {
  SeekerProfile,
  SeekerProfileSchema,
} from './schemas/seeker-profile.schema';
import { JobAlertsService } from './services/job-alerts.service';
import { ProfilesService } from './services/profiles.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SeekerProfile.name, schema: SeekerProfileSchema },
      { name: SavedJob.name, schema: SavedJobSchema },
      { name: Job.name, schema: JobSchema },
      { name: Application.name, schema: ApplicationSchema },
    ]),
    UsersModule,
    JobsModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService, JobAlertsService],
  exports: [ProfilesService, JobAlertsService],
})
export class ProfilesModule {}
