import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  CompanyVerificationStatus,
  EmploymentType,
  ExperienceLevel,
  JobStatus,
  WorkplaceType,
} from '../../../common/enums/domain.enum';
import { Role } from '../../../common/enums/role.enum';
import { paginateMeta } from '../../../common/dto/pagination.dto';
import { uniqueSlug } from '../../../common/utils/slug.util';
import { BillingService } from '../../billing/services/billing.service';
import { CompaniesService } from '../../companies/services/companies.service';
import { EmployersService } from '../../employers/services/employers.service';
import { CreateJobDto, SearchJobsDto, UpdateJobDto } from '../dto/job.dto';
import { JobsRepository } from '../repositories/jobs.repository';
import { JobDocument } from '../schemas/job.schema';

@Injectable()
export class JobsService implements OnModuleInit {
  constructor(
    private readonly jobsRepository: JobsRepository,
    private readonly employersService: EmployersService,
    private readonly companiesService: CompaniesService,
    @Inject(forwardRef(() => BillingService))
    private readonly billingService: BillingService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const company = await this.companiesService.findBySlug('novahire-africa');
      const count = await this.jobsRepository.countByCompany(
        company._id.toString(),
      );
      if (count > 0) return;

      const seeds: Array<
        Partial<CreateJobDto> & { title: string; description: string }
      > = [
        {
          title: 'Senior Frontend Engineer',
          description:
            'Build world-class React experiences for remote African talent platforms. TypeScript required.',
          employmentType: EmploymentType.FULL_TIME,
          workplaceType: WorkplaceType.REMOTE,
          skills: ['React', 'TypeScript'],
          category: 'Software Engineering',
          experienceLevel: ExperienceLevel.SENIOR,
          salaryMin: 70000,
          salaryMax: 110000,
          isFeatured: true,
        },
        {
          title: 'Backend Engineer (NestJS)',
          description:
            'Design scalable NestJS APIs with MongoDB. Experience with Redis and queues is a plus.',
          employmentType: EmploymentType.FULL_TIME,
          workplaceType: WorkplaceType.REMOTE,
          skills: ['NestJS', 'MongoDB'],
          category: 'Software Engineering',
          experienceLevel: ExperienceLevel.MID,
          salaryMin: 65000,
          salaryMax: 95000,
          isFeatured: true,
        },
        {
          title: 'Product Designer',
          description:
            'Shape product UX for a hiring marketplace used across Africa. Figma fluency required.',
          employmentType: EmploymentType.CONTRACT,
          workplaceType: WorkplaceType.HYBRID,
          location: 'Lagos',
          skills: ['Figma', 'UX'],
          category: 'Product & Design',
          experienceLevel: ExperienceLevel.MID,
          salaryMin: 45,
          salaryMax: 75,
          salaryCurrency: 'USD',
          isFeatured: true,
        },
        {
          title: 'DevOps Engineer',
          description:
            'Own CI/CD, Docker, and cloud infrastructure for a multi-tenant SaaS hiring platform.',
          employmentType: EmploymentType.FULL_TIME,
          workplaceType: WorkplaceType.REMOTE,
          skills: ['Docker', 'AWS'],
          category: 'Software Engineering',
          experienceLevel: ExperienceLevel.SENIOR,
          salaryMin: 80000,
          salaryMax: 120000,
          isFeatured: true,
        },
        {
          title: 'Data Analyst',
          description:
            'Analyze hiring funnel metrics and build dashboards for growth and product teams.',
          employmentType: EmploymentType.FULL_TIME,
          workplaceType: WorkplaceType.REMOTE,
          skills: ['SQL', 'Python'],
          category: 'Data & AI',
          experienceLevel: ExperienceLevel.JUNIOR,
          salaryMin: 40000,
          salaryMax: 60000,
        },
        {
          title: 'Customer Success Manager',
          description:
            'Support employer accounts, onboard new companies, and drive retention across Africa.',
          employmentType: EmploymentType.FULL_TIME,
          workplaceType: WorkplaceType.REMOTE,
          skills: ['CRM', 'Communication'],
          category: 'Customer Success',
          experienceLevel: ExperienceLevel.MID,
          salaryMin: 35000,
          salaryMax: 55000,
        },
        {
          title: 'Mobile Engineer (React Native)',
          description:
            'Ship performant React Native apps for job seekers applying on the go.',
          employmentType: EmploymentType.FULL_TIME,
          workplaceType: WorkplaceType.REMOTE,
          skills: ['React Native', 'TypeScript'],
          category: 'Software Engineering',
          experienceLevel: ExperienceLevel.MID,
          salaryMin: 60000,
          salaryMax: 90000,
        },
        {
          title: 'Growth Marketing Lead',
          description:
            'Own acquisition channels for talent and employer sides of a remote jobs marketplace.',
          employmentType: EmploymentType.FULL_TIME,
          workplaceType: WorkplaceType.REMOTE,
          skills: ['SEO', 'Paid Ads'],
          category: 'Marketing',
          experienceLevel: ExperienceLevel.SENIOR,
          salaryMin: 55000,
          salaryMax: 85000,
          isUrgent: true,
        },
      ];

      for (const seed of seeds) {
        const slug = uniqueSlug(seed.title);
        await this.jobsRepository.create({
          companyId: company._id,
          postedByUserId: company.createdByUserId,
          title: seed.title,
          slug,
          description: seed.description,
          employmentType: seed.employmentType || EmploymentType.FULL_TIME,
          workplaceType: seed.workplaceType || WorkplaceType.REMOTE,
          location: seed.location || 'Worldwide',
          timezone: 'UTC',
          salaryMin: seed.salaryMin ?? null,
          salaryMax: seed.salaryMax ?? null,
          salaryCurrency: seed.salaryCurrency || 'USD',
          experienceLevel: seed.experienceLevel || ExperienceLevel.MID,
          skills: seed.skills || [],
          category: seed.category || 'Software Engineering',
          status: JobStatus.PUBLISHED,
          isFeatured: seed.isFeatured || false,
          isUrgent: seed.isUrgent || false,
          easyApply: true,
          publishedAt: new Date(),
        });
      }
    } catch {
      // Seed is best-effort when DB is unavailable during tests.
    }
  }

  private async assertCanManageJobs(userId: string, role: string) {
    this.employersService.ensureEmployerRole(role);
    const employer =
      await this.employersService.requireEmployerWithCompany(userId);
    const company = await this.companiesService.findByIdOrFail(
      employer.companyId!.toString(),
    );
    return { employer, company };
  }

  async create(
    userId: string,
    role: string,
    dto: CreateJobDto,
  ): Promise<JobDocument> {
    const { company } = await this.assertCanManageJobs(userId, role);
    let slug = uniqueSlug(dto.title);
    while (await this.jobsRepository.findBySlug(slug)) {
      slug = uniqueSlug(dto.title);
    }

    return this.jobsRepository.create({
      companyId: company._id,
      postedByUserId: new Types.ObjectId(userId),
      title: dto.title,
      slug,
      description: dto.description,
      employmentType: dto.employmentType || EmploymentType.FULL_TIME,
      workplaceType: dto.workplaceType || WorkplaceType.REMOTE,
      location: dto.location || 'Worldwide',
      timezone: dto.timezone || 'UTC',
      salaryMin: dto.salaryMin ?? null,
      salaryMax: dto.salaryMax ?? null,
      salaryCurrency: dto.salaryCurrency || 'USD',
      experienceLevel: dto.experienceLevel || ExperienceLevel.MID,
      skills: dto.skills || [],
      category: dto.category || 'Software Engineering',
      status: JobStatus.DRAFT,
      isFeatured: dto.isFeatured || false,
      isUrgent: dto.isUrgent || false,
      easyApply: dto.easyApply ?? true,
      externalApplyUrl: dto.externalApplyUrl || '',
      department: (dto as { department?: string }).department || '',
      country: (dto as { country?: string }).country || '',
      openings: (dto as { openings?: number }).openings || 1,
      preferredSkills:
        (dto as { preferredSkills?: string[] }).preferredSkills || [],
      responsibilities:
        (dto as { responsibilities?: string }).responsibilities || '',
      requirements: (dto as { requirements?: string }).requirements || '',
      benefits: (dto as { benefits?: string }).benefits || '',
      hiringProcess: (dto as { hiringProcess?: string }).hiringProcess || '',
      deadline: (dto as unknown as { deadline?: string }).deadline
        ? new Date((dto as unknown as { deadline: string }).deadline)
        : null,
      screeningQuestions:
        (
          dto as unknown as {
            screeningQuestions?: Array<{
              id: string;
              prompt: string;
              type: string;
            }>;
          }
        ).screeningQuestions || [],
      tags: (dto as unknown as { tags?: string[] }).tags || [],
      scheduledPublishAt: (dto as unknown as { scheduledPublishAt?: string })
        .scheduledPublishAt
        ? new Date(
            (dto as unknown as { scheduledPublishAt: string })
              .scheduledPublishAt,
          )
        : null,
      sponsorBudget:
        (dto as unknown as { sponsorBudget?: number }).sponsorBudget || 0,
    });
  }

  async update(
    id: string,
    userId: string,
    role: string,
    dto: UpdateJobDto,
  ): Promise<JobDocument> {
    const job = await this.findByIdOrFail(id);
    await this.assertJobOwner(job, userId, role);
    const updated = await this.jobsRepository.updateById(id, dto);
    if (!updated) throw new NotFoundException('Job not found');
    return updated;
  }

  async publish(
    id: string,
    userId: string,
    role: string,
  ): Promise<JobDocument> {
    const job = await this.findByIdOrFail(id);
    const { company } = await this.assertJobOwner(job, userId, role);
    if (company.verificationStatus !== CompanyVerificationStatus.VERIFIED) {
      throw new ForbiddenException(
        'Company must be verified before publishing jobs',
      );
    }
    if (job.isFeatured || job.isUrgent) {
      await this.billingService.assertFeaturedAllowed(
        userId,
        company._id.toString(),
        id,
      );
    }
    if (job.scheduledPublishAt && job.scheduledPublishAt > new Date()) {
      const updated = await this.jobsRepository.updateById(id, {
        status: JobStatus.DRAFT,
        scheduledPublishAt: job.scheduledPublishAt,
      });
      if (!updated) throw new NotFoundException('Job not found');
      return updated;
    }
    const updated = await this.jobsRepository.updateById(id, {
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
      paused: false,
    });
    if (!updated) throw new NotFoundException('Job not found');
    return updated;
  }

  async duplicate(id: string, userId: string, role: string) {
    const job = await this.findByIdOrFail(id);
    await this.assertJobOwner(job, userId, role);
    let slug = uniqueSlug(`${job.title}-copy`);
    while (await this.jobsRepository.findBySlug(slug)) {
      slug = uniqueSlug(`${job.title}-copy`);
    }
    const plain = (typeof job.toObject === 'function'
      ? job.toObject()
      : job) as unknown as Record<string, unknown>;
    const {
      _id: _omit,
      id: _omit2,
      createdAt: _c,
      updatedAt: _u,
      publishedAt: _p,
      ...rest
    } = plain;
    return this.jobsRepository.create({
      ...rest,
      title: `${job.title} (Copy)`,
      slug,
      status: JobStatus.DRAFT,
      publishedAt: null,
      paused: false,
      archived: false,
    });
  }

  async archive(id: string, userId: string, role: string) {
    const job = await this.findByIdOrFail(id);
    await this.assertJobOwner(job, userId, role);
    const updated = await this.jobsRepository.updateById(id, {
      archived: true,
      status: JobStatus.CLOSED,
    });
    if (!updated) throw new NotFoundException('Job not found');
    return updated;
  }

  async pause(id: string, userId: string, role: string) {
    const job = await this.findByIdOrFail(id);
    await this.assertJobOwner(job, userId, role);
    const updated = await this.jobsRepository.updateById(id, { paused: true });
    if (!updated) throw new NotFoundException('Job not found');
    return updated;
  }

  async unpause(id: string, userId: string, role: string) {
    const job = await this.findByIdOrFail(id);
    await this.assertJobOwner(job, userId, role);
    const updated = await this.jobsRepository.updateById(id, { paused: false });
    if (!updated) throw new NotFoundException('Job not found');
    return updated;
  }

  async close(id: string, userId: string, role: string): Promise<JobDocument> {
    const job = await this.findByIdOrFail(id);
    await this.assertJobOwner(job, userId, role);
    const updated = await this.jobsRepository.updateById(id, {
      status: JobStatus.CLOSED,
    });
    if (!updated) throw new NotFoundException('Job not found');
    return updated;
  }

  async softDelete(id: string, userId: string, role: string): Promise<void> {
    const job = await this.findByIdOrFail(id);
    await this.assertJobOwner(job, userId, role);
    await this.jobsRepository.softDelete(id);
  }

  async mine(userId: string, role: string) {
    const { company } = await this.assertCanManageJobs(userId, role);
    const jobs = await this.jobsRepository.findMine(company._id.toString());
    return jobs.map((job) => {
      const plain =
        typeof job.toObject === 'function' ? job.toObject() : { ...job };
      return {
        ...plain,
        applicationCount: 0,
        views: job.views || 0,
        bookmarks: job.bookmarks || 0,
        shares: job.shares || 0,
        impressions: job.impressions || job.views || 0,
        clicks: job.clicks || 0,
      };
    });
  }

  async findBySlug(slug: string): Promise<JobDocument> {
    const job = await this.jobsRepository.findBySlug(slug);
    if (!job || (job.status !== JobStatus.PUBLISHED && job.isDeleted)) {
      // Allow draft only if published or not deleted — public only sees published
    }
    if (!job || job.status !== JobStatus.PUBLISHED) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async findByIdOrFail(id: string): Promise<JobDocument> {
    const job = await this.jobsRepository.findById(id);
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async search(query: SearchJobsDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skills = query.skills
      ? query.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    const { items, total } = await this.jobsRepository.search({
      q: query.q,
      employmentType: query.employmentType,
      workplaceType: query.workplaceType,
      category: query.category,
      experienceLevel: query.experienceLevel,
      skills,
      isFeatured: query.isFeatured,
      status: JobStatus.PUBLISHED,
      page,
      limit,
      sort: query.sort || 'recent',
    });

    return {
      data: items,
      meta: paginateMeta(page, limit, total),
      message: 'OK',
    };
  }

  private async assertJobOwner(job: JobDocument, userId: string, role: string) {
    if (
      role === Role.SUPER_ADMIN ||
      role === Role.ADMIN ||
      role === Role.MODERATOR
    ) {
      const company = await this.companiesService.findByIdOrFail(
        job.companyId.toString(),
      );
      return { company };
    }
    const { company } = await this.assertCanManageJobs(userId, role);
    if (job.companyId.toString() !== company._id.toString()) {
      throw new ForbiddenException('Not allowed to manage this job');
    }
    return { company };
  }
}
