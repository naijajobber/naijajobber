import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ApplicationStatus,
  JobStatus,
} from '../../../common/enums/domain.enum';
import { Role } from '../../../common/enums/role.enum';
import { EmployersService } from '../../employers/services/employers.service';
import { InterviewsService } from '../../interviews/services/interviews.service';
import { JobsService } from '../../jobs/services/jobs.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { ProfilesService } from '../../profiles/services/profiles.service';
import { UsersRepository } from '../../users/repositories/users.repository';
import {
  CreateApplicationDto,
  UpdateApplicationStatusDto,
} from '../dto/application.dto';
import { ApplicationsRepository } from '../repositories/applications.repository';
import { ApplicationDocument } from '../schemas/application.schema';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly jobsService: JobsService,
    private readonly employersService: EmployersService,
    private readonly notificationsService: NotificationsService,
    private readonly profilesService: ProfilesService,
    private readonly interviewsService: InterviewsService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async apply(
    userId: string,
    role: string,
    dto: CreateApplicationDto,
  ): Promise<ApplicationDocument> {
    if (role !== Role.JOB_SEEKER) {
      throw new ForbiddenException('Only job seekers can apply');
    }

    const job = await this.jobsService.findByIdOrFail(dto.jobId);
    if (job.status !== JobStatus.PUBLISHED) {
      throw new BadRequestException('Job is not open for applications');
    }

    const existing = await this.applicationsRepository.findByJobAndApplicant(
      dto.jobId,
      userId,
    );
    if (existing) {
      throw new ConflictException('You already applied to this job');
    }

    const profileCv = await this.profilesService.getCvUrlForUser(userId);
    const resumeUrl = (dto.resumeUrl || '').trim() || profileCv || '';

    const created = await this.applicationsRepository.create({
      jobId: new Types.ObjectId(dto.jobId),
      applicantUserId: new Types.ObjectId(userId),
      coverLetter: dto.coverLetter || '',
      resumeUrl,
      status: ApplicationStatus.SUBMITTED,
      timeline: [
        {
          status: ApplicationStatus.SUBMITTED,
          note: 'Application submitted',
          at: new Date(),
        },
      ],
    });

    await this.notificationsService.notify({
      userId: job.postedByUserId.toString(),
      type: 'NEW_APPLICATION',
      title: 'New application received',
      body: `Someone applied to ${job.title}`,
      data: {
        applicationId: created._id.toString(),
        jobId: job._id.toString(),
      },
    });

    return created;
  }

  async mine(userId: string) {
    const apps = await this.applicationsRepository.findByApplicant(userId);
    return Promise.all(
      apps.map(async (app) => {
        const plain = typeof app.toObject === 'function' ? app.toObject() : app;
        try {
          const job = await this.jobsService.findByIdOrFail(app.jobId.toString());
          return {
            ...plain,
            job: {
              _id: job._id,
              title: job.title,
              slug: job.slug,
              status: job.status,
              location: job.location,
              companyId: job.companyId,
            },
          };
        } catch {
          return { ...plain, job: null };
        }
      }),
    );
  }

  async withdraw(id: string, userId: string): Promise<ApplicationDocument> {
    const application = await this.findOrFail(id);
    if (application.applicantUserId.toString() !== userId) {
      throw new ForbiddenException('Not your application');
    }
    if (application.status === ApplicationStatus.WITHDRAWN) {
      return application;
    }

    const timeline = [
      ...application.timeline,
      {
        status: ApplicationStatus.WITHDRAWN,
        note: 'Applicant withdrew',
        at: new Date(),
      },
    ];

    const updated = await this.applicationsRepository.updateById(id, {
      status: ApplicationStatus.WITHDRAWN,
      timeline,
    });
    if (!updated) throw new NotFoundException('Application not found');
    return updated;
  }

  async listForJob(
    jobId: string,
    userId: string,
    role: string,
  ) {
    const job = await this.jobsService.findByIdOrFail(jobId);
    await this.assertEmployerOwnsJob(job.companyId.toString(), userId, role);
    const apps = await this.applicationsRepository.findByJob(jobId);
    return this.enrichApplications(apps, job);
  }

  async listForCompany(userId: string, role: string) {
    const employer =
      await this.employersService.requireEmployerWithCompany(userId);
    this.employersService.ensureEmployerRole(role);
    const jobs = await this.jobsService.mine(userId, role);
    const all: unknown[] = [];
    for (const job of jobs as Array<{ _id: { toString: () => string }; title?: string }>) {
      const apps = await this.applicationsRepository.findByJob(
        job._id.toString(),
      );
      const enriched = await this.enrichApplications(apps, job);
      all.push(...enriched);
    }
    return all;
  }

  async bulkUpdateStatus(
    userId: string,
    role: string,
    dto: { ids: string[]; status: ApplicationStatus; note?: string },
  ) {
    const results = [];
    for (const id of dto.ids || []) {
      results.push(
        await this.updateStatus(id, userId, role, {
          status: dto.status,
          note: dto.note,
        }),
      );
    }
    return results;
  }

  private async enrichApplications(
    apps: ApplicationDocument[],
    job: { _id?: { toString: () => string }; title?: string; slug?: string },
  ) {
    return Promise.all(
      apps.map(async (app) => {
        const plain =
          typeof app.toObject === 'function' ? app.toObject() : app;
        const user = await this.usersRepository.findById(
          app.applicantUserId.toString(),
        );
        let seeker: Record<string, unknown> = {};
        try {
          const profile = await this.profilesService.getOrCreateMe(
            app.applicantUserId.toString(),
          );
          seeker = {
            firstName: user?.firstName,
            lastName: user?.lastName,
            avatarUrl: user?.avatarUrl,
            location: user?.location,
            skills: profile.skills,
            experience: profile.experience,
            education: profile.education,
            availabilityStatus: profile.availabilityStatus,
          };
        } catch {
          seeker = {
            firstName: user?.firstName,
            lastName: user?.lastName,
            avatarUrl: user?.avatarUrl,
            location: user?.location,
          };
        }
        return {
          ...plain,
          seeker,
          job: {
            _id: job._id,
            title: job.title,
            slug: (job as { slug?: string }).slug,
          },
        };
      }),
    );
  }

  async updateStatus(
    id: string,
    userId: string,
    role: string,
    dto: UpdateApplicationStatusDto,
  ): Promise<ApplicationDocument> {
    const application = await this.findOrFail(id);
    const job = await this.jobsService.findByIdOrFail(
      application.jobId.toString(),
    );
    await this.assertEmployerOwnsJob(job.companyId.toString(), userId, role);

    if (dto.status === ApplicationStatus.WITHDRAWN) {
      throw new BadRequestException('Employers cannot set WITHDRAWN status');
    }

    const timeline = [
      ...application.timeline,
      {
        status: dto.status,
        note: dto.note || '',
        at: new Date(),
      },
    ];

    const updated = await this.applicationsRepository.updateById(id, {
      status: dto.status,
      timeline,
    });
    if (!updated) throw new NotFoundException('Application not found');

    await this.notificationsService.notify({
      userId: application.applicantUserId.toString(),
      type: 'APPLICATION_STATUS',
      title: 'Application status updated',
      body: `Your application is now ${dto.status}`,
      data: {
        applicationId: id,
        status: dto.status,
      },
    });

    if (dto.status === ApplicationStatus.INTERVIEW) {
      await this.interviewsService.ensureDraftForApplication({
        jobId: application.jobId.toString(),
        applicationId: id,
        seekerUserId: application.applicantUserId.toString(),
        employerUserId: job.postedByUserId.toString(),
      });
    }

    return updated;
  }

  private async findOrFail(id: string): Promise<ApplicationDocument> {
    const application = await this.applicationsRepository.findById(id);
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  private async assertEmployerOwnsJob(
    companyId: string,
    userId: string,
    role: string,
  ) {
    if (
      role === Role.SUPER_ADMIN ||
      role === Role.ADMIN ||
      role === Role.MODERATOR
    ) {
      return;
    }
    this.employersService.ensureEmployerRole(role);
    const employer =
      await this.employersService.requireEmployerWithCompany(userId);
    if (employer.companyId!.toString() !== companyId) {
      throw new ForbiddenException('Not allowed to view these applications');
    }
  }
}
