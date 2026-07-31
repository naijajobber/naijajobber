import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployersModule } from '../employers/employers.module';
import { SupportController } from './controllers/support.controller';
import {
  SupportTicket,
  SupportTicketSchema,
} from './schemas/support-ticket.schema';
import { SupportService } from './services/support.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportTicket.name, schema: SupportTicketSchema },
    ]),
    EmployersModule,
  ],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
