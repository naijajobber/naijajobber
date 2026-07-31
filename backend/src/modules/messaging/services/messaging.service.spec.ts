import { ForbiddenException } from '@nestjs/common';
import { Role } from '../../../common/enums/role.enum';
import { ApplicationsRepository } from '../../applications/repositories/applications.repository';
import { EmployersService } from '../../employers/services/employers.service';
import { JobsService } from '../../jobs/services/jobs.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { MessagingRepository } from '../repositories/messaging.repository';
import { MessagingService } from './messaging.service';

describe('MessagingService', () => {
  let service: MessagingService;
  let repo: jest.Mocked<MessagingRepository>;

  beforeEach(() => {
    repo = {
      findConversationById: jest.fn(),
      listForUser: jest.fn(),
    } as unknown as jest.Mocked<MessagingRepository>;

    service = new MessagingService(
      repo,
      {} as ApplicationsRepository,
      {} as JobsService,
      {} as EmployersService,
      {} as NotificationsService,
    );
  });

  it('rejects non-participants', async () => {
    repo.findConversationById.mockResolvedValue({
      participantIds: [{ toString: () => '507f1f77bcf86cd799439011' }],
    } as never);

    await expect(
      service.assertParticipant(
        'c1',
        '507f1f77bcf86cd799439099',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows participants', async () => {
    repo.findConversationById.mockResolvedValue({
      _id: 'c1',
      participantIds: [{ toString: () => '507f1f77bcf86cd799439011' }],
    } as never);

    const conv = await service.assertParticipant(
      'c1',
      '507f1f77bcf86cd799439011',
    );
    expect(conv).toBeTruthy();
  });
});
