import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiInfrastructureModule } from '../../infrastructure/ai/ai-infrastructure.module';
import { ApplicationsModule } from '../applications/applications.module';
import { JobsModule } from '../jobs/jobs.module';
import { UsersModule } from '../users/users.module';
import { AiController } from './controllers/ai.controller';
import { AiRepository } from './repositories/ai.repository';
import { AiRun, AiRunSchema } from './schemas/ai-run.schema';
import { AiService } from './services/ai.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AiRun.name, schema: AiRunSchema }]),
    AiInfrastructureModule,
    UsersModule,
    JobsModule,
    forwardRef(() => ApplicationsModule),
  ],
  controllers: [AiController],
  providers: [AiService, AiRepository],
  exports: [AiService],
})
export class AiModule {}
