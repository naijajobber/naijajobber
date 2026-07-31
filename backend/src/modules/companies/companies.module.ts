import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadsModule } from '../../infrastructure/uploads/uploads.module';
import { EmployersModule } from '../employers/employers.module';
import { CompaniesController } from './controllers/companies.controller';
import { CompaniesRepository } from './repositories/companies.repository';
import { Company, CompanySchema } from './schemas/company.schema';
import { CompaniesService } from './services/companies.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
    EmployersModule,
    UploadsModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompaniesRepository],
  exports: [CompaniesService, CompaniesRepository],
})
export class CompaniesModule {}
