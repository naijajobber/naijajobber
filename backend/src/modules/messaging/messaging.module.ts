import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationsModule } from '../applications/applications.module';
import { EmployersModule } from '../employers/employers.module';
import { JobsModule } from '../jobs/jobs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MessagingController } from './controllers/messaging.controller';
import { MessagingGateway } from './gateways/messaging.gateway';
import { MessagingRepository } from './repositories/messaging.repository';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { MessagingService } from './services/messaging.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    JwtModule.register({}),
    ApplicationsModule,
    JobsModule,
    EmployersModule,
    NotificationsModule,
  ],
  controllers: [MessagingController],
  providers: [MessagingService, MessagingRepository, MessagingGateway],
  exports: [MessagingService],
})
export class MessagingModule {}
