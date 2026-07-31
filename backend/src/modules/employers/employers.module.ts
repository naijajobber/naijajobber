import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Application,
  ApplicationSchema,
} from '../applications/schemas/application.schema';
import { BillingModule } from '../billing/billing.module';
import { Company, CompanySchema } from '../companies/schemas/company.schema';
import {
  Interview,
  InterviewSchema,
} from '../interviews/schemas/interview.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import {
  Notification,
  NotificationSchema,
} from '../notifications/schemas/notification.schema';
import { UsersModule } from '../users/users.module';
import { EmployersController } from './controllers/employers.controller';
import { EmployersRepository } from './repositories/employers.repository';
import { Employer, EmployerSchema } from './schemas/employer.schema';
import { EmployersService } from './services/employers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employer.name, schema: EmployerSchema },
      { name: Job.name, schema: JobSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: Interview.name, schema: InterviewSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
    forwardRef(() => BillingModule),
    UsersModule,
  ],
  controllers: [EmployersController],
  providers: [EmployersService, EmployersRepository],
  exports: [EmployersService, EmployersRepository],
})
export class EmployersModule {}
