import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  NoopPushProvider,
  NoopSmsProvider,
} from '../../infrastructure/notifications/noop-providers';
import { QueuesModule } from '../../infrastructure/queues/queues.module';
import { UsersModule } from '../users/users.module';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsRepository } from './repositories/notifications.repository';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import {
  NotificationPreference,
  NotificationPreferenceSchema,
} from './schemas/preference.schema';
import { NotificationsService } from './services/notifications.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      {
        name: NotificationPreference.name,
        schema: NotificationPreferenceSchema,
      },
    ]),
    UsersModule,
    QueuesModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    NoopSmsProvider,
    NoopPushProvider,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
