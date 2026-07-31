import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { EmailDispatchService } from '../../../infrastructure/queues/email-dispatch.service';
import {
  NoopPushProvider,
  NoopSmsProvider,
} from '../../../infrastructure/notifications/noop-providers';
import { UsersRepository } from '../../users/repositories/users.repository';
import { UpdatePreferencesDto } from '../dto/notification.dto';
import { NotificationsRepository } from '../repositories/notifications.repository';

export type NotifyInput = {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  emailHtml?: string;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly emailDispatch: EmailDispatchService,
    private readonly usersRepository: UsersRepository,
    private readonly smsProvider: NoopSmsProvider,
    private readonly pushProvider: NoopPushProvider,
  ) {}

  async notify(input: NotifyInput) {
    const prefs = await this.notificationsRepository.getOrCreatePreferences(
      input.userId,
    );

    let notification = null;
    if (prefs.inAppEnabled) {
      notification = await this.notificationsRepository.create({
        userId: new Types.ObjectId(input.userId),
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data || {},
        inApp: true,
        emailSent: false,
        readAt: null,
      });
    }

    if (prefs.emailEnabled) {
      const user = await this.usersRepository.findById(input.userId);
      if (user) {
        await this.emailDispatch.enqueue({
          to: user.email,
          subject: input.title,
          html:
            input.emailHtml ||
            `<p>${input.body}</p><p>— NaijaJobber</p>`,
        });
        if (notification) {
          await this.notificationsRepository.setEmailSent(
            notification._id.toString(),
          );
        }
      }
    }

    if (prefs.pushEnabled) {
      await this.pushProvider.send(input.userId, input.title, input.body);
    }
    if (prefs.smsEnabled) {
      await this.smsProvider.send('', input.body);
    }

    return notification;
  }

  async list(userId: string) {
    return this.notificationsRepository.findByUser(userId);
  }

  async unreadCount(userId: string) {
    const count = await this.notificationsRepository.countUnread(userId);
    return { count };
  }

  async markRead(id: string, userId: string) {
    const n = await this.notificationsRepository.markRead(id, userId);
    if (!n) throw new NotFoundException('Notification not found');
    return n;
  }

  async markAllRead(userId: string) {
    const modified = await this.notificationsRepository.markAllRead(userId);
    return { message: 'OK', modified };
  }

  async getPreferences(userId: string) {
    return this.notificationsRepository.getOrCreatePreferences(userId);
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    return this.notificationsRepository.updatePreferences(userId, dto);
  }
}
