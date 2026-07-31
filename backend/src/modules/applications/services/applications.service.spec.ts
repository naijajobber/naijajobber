import { ConflictException, ForbiddenException } from '@nestjs/common';
import {
  ApplicationStatus,
  JobStatus,
} from '../../../common/enums/domain.enum';
import { Role } from '../../../common/enums/role.enum';
import { EmployersService } from '../../employers/services/employers.service';
import { JobsService } from '../../jobs/services/jobs.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { ApplicationsRepository } from '../repositories/applications.repository';
import { ApplicationsService } from './applications.service';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let repo: jest.Mocked<ApplicationsRepository>;
  let jobs: jest.Mocked<JobsService>;
  let employers: jest.Mocked<EmployersService>;
  let notifications: jest.Mocked<Pick<NotificationsService, 'notify'>>;

  beforeEach(() => {
    repo = {
      findByJobAndApplicant: jest.fn(),
      create: jest.fn(),
      findByApplicant: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      findByJob: jest.fn(),
    } as unknown as jest.Mocked<ApplicationsRepository>;

    jobs = {
      findByIdOrFail: jest.fn(),
    } as unknown as jest.Mocked<JobsService>;

    employers = {
      ensureEmployerRole: jest.fn(),
      requireEmployerWithCompany: jest.fn(),
    } as unknown as jest.Mocked<EmployersService>;

    notifications = {
      notify: jest.fn().mockResolvedValue(null),
    };

    const profiles = {
      getCvUrlForUser: jest.fn().mockResolvedValue(''),
    };

    const interviews = {
      ensureDraftForApplication: jest.fn().mockResolvedValue(null),
    };

    service = new ApplicationsService(
      repo,
      jobs,
      employers,
      notifications as unknown as NotificationsService,
      profiles as never,
      interviews as never,
      { findById: jest.fn() } as never,
    );
  });

  it('applies to published jobs', async () => {
    jobs.findByIdOrFail.mockResolvedValue({
      status: JobStatus.PUBLISHED,
      _id: { toString: () => 'j1' },
      title: 'Remote Engineer',
      postedByUserId: { toString: () => '507f1f77bcf86cd799439099' },
    } as never);
    repo.findByJobAndApplicant.mockResolvedValue(null);
    repo.create.mockResolvedValue({
      _id: { toString: () => 'a1' },
      status: ApplicationStatus.SUBMITTED,
    } as never);

    const app = await service.apply(
      '507f1f77bcf86cd799439011',
      Role.JOB_SEEKER,
      {
        jobId: '507f1f77bcf86cd799439012',
      },
    );
    expect(app.status).toBe(ApplicationStatus.SUBMITTED);
    expect(notifications.notify).toHaveBeenCalled();
  });

  it('blocks duplicate applications', async () => {
    jobs.findByIdOrFail.mockResolvedValue({
      status: JobStatus.PUBLISHED,
    } as never);
    repo.findByJobAndApplicant.mockResolvedValue({ _id: 'a1' } as never);

    await expect(
      service.apply('seeker', Role.JOB_SEEKER, {
        jobId: '507f1f77bcf86cd799439011',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('blocks employer from applying', async () => {
    await expect(
      service.apply('emp', Role.EMPLOYER, {
        jobId: '507f1f77bcf86cd799439011',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
