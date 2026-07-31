import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationsModule } from '../applications/applications.module';
import { EmployersModule } from '../employers/employers.module';
import { AssessmentsController } from './controllers/assessments.controller';
import {
  Assessment,
  AssessmentSchema,
  AssessmentSubmission,
  AssessmentSubmissionSchema,
} from './schemas/assessment.schema';
import { AssessmentsService } from './services/assessments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Assessment.name, schema: AssessmentSchema },
      { name: AssessmentSubmission.name, schema: AssessmentSubmissionSchema },
    ]),
    EmployersModule,
    forwardRef(() => ApplicationsModule),
  ],
  controllers: [AssessmentsController],
  providers: [AssessmentsService],
})
export class AssessmentsModule {}
