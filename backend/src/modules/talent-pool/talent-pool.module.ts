import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployersModule } from '../employers/employers.module';
import { TalentPoolController } from './controllers/talent-pool.controller';
import {
  TalentCandidate,
  TalentCandidateSchema,
} from './schemas/talent-candidate.schema';
import { TalentPoolService } from './services/talent-pool.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TalentCandidate.name, schema: TalentCandidateSchema },
    ]),
    EmployersModule,
  ],
  controllers: [TalentPoolController],
  providers: [TalentPoolService],
  exports: [TalentPoolService],
})
export class TalentPoolModule {}
