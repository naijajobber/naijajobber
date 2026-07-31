import { NotificationsRepository } from '../repositories/notifications.repository';
import { NotificationsService } from './notifications.service';
import { EmailDispatchService } from '../../../infrastructure/queues/email-dispatch.service';
import {
  NoopPushProvider,
  NoopSmsProvider,
} from '../../../infrastructure/notifications/noop-providers';
import { UsersRepository } from '../../users/repositories/users.repository';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repo: jest.Mocked<NotificationsRepository>;

  beforeEach(() => {
    repo = {
      getOrCreatePreferences: jest.fn().mockResolvedValue({
        emailEnabled: false,
        inAppEnabled: true,
        pushEnabled: false,
        smsEnabled: false,
      }),
      create: jest.fn().mockResolvedValue({
        _id: { toString: () => 'n1' },
        title: 'Hi',
      }),
      markRead: jest.fn().mockResolvedValue({ _id: 'n1', readAt: new Date() }),
      findByUser: jest.fn(),
      countUnread: jest.fn().mockResolvedValue(2),
      markAllRead: jest.fn().mockResolvedValue(2),
      updatePreferences: jest.fn(),
      setEmailSent: jest.fn(),
    } as unknown as jest.Mocked<NotificationsRepository>;

    service = new NotificationsService(
      repo,
      { enqueue: jest.fn() } as unknown as EmailDispatchService,
      { findById: jest.fn() } as unknown as UsersRepository,
      new NoopSmsProvider(),
      new NoopPushProvider(),
    );
  });

  it('creates in-app notification', async () => {
    const n = await service.notify({
      userId: '507f1f77bcf86cd799439011',
      type: 'TEST',
      title: 'Hi',
      body: 'Body',
    });
    expect(repo.create).toHaveBeenCalled();
    expect(n?.title).toBe('Hi');
  });

  it('returns unread count', async () => {
    const res = await service.unreadCount('507f1f77bcf86cd799439011');
    expect(res.count).toBe(2);
  });

  it('marks notification read', async () => {
    const n = await service.markRead('n1', '507f1f77bcf86cd799439011');
    expect(n).toBeTruthy();
  });
});
