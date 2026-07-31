import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ApplicationStatus,
  CompanyRole,
  InterviewStatus,
  InviteStatus,
  JobStatus,
} from '../../../common/enums/domain.enum';
import { Role } from '../../../common/enums/role.enum';
import {
  Application,
  ApplicationDocument,
} from '../../applications/schemas/application.schema';
import { BillingService } from '../../billing/services/billing.service';
import {
  Company,
  CompanyDocument,
} from '../../companies/schemas/company.schema';
import {
  Interview,
  InterviewDocument,
} from '../../interviews/schemas/interview.schema';
import { Job, JobDocument } from '../../jobs/schemas/job.schema';
import {
  Notification,
  NotificationDocument,
} from '../../notifications/schemas/notification.schema';
import { UsersRepository } from '../../users/repositories/users.repository';
import { UpdateEmployerDto, UpsertEmployerDto } from '../dto/employer.dto';
import { EmployersRepository } from '../repositories/employers.repository';
import { EmployerDocument } from '../schemas/employer.schema';

@Injectable()
export class EmployersService {
  constructor(
    private readonly employersRepository: EmployersRepository,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    @InjectModel(Interview.name)
    private readonly interviewModel: Model<InterviewDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(Company.name)
    private readonly companyModel: Model<CompanyDocument>,
    @Inject(forwardRef(() => BillingService))
    private readonly billingService: BillingService,
    private readonly usersRepository: UsersRepository,
  ) {}

  ensureEmployerRole(role: string): void {
    if (role !== Role.EMPLOYER && role !== Role.RECRUITER) {
      throw new ForbiddenException('Employer or recruiter role required');
    }
  }

  async upsertMe(
    userId: string,
    role: string,
    dto: UpsertEmployerDto = {},
  ): Promise<EmployerDocument> {
    this.ensureEmployerRole(role);
    const existing = await this.employersRepository.findByUserId(userId);
    if (existing) {
      if (dto.title) {
        return (
          (await this.employersRepository.updateById(existing._id.toString(), {
            title: dto.title,
          })) ?? existing
        );
      }
      return existing;
    }

    return this.employersRepository.create({
      userId: new Types.ObjectId(userId),
      title: dto.title || 'Recruiter',
      companyId: null,
      isPrimary: true,
      companyRole: CompanyRole.OWNER,
      inviteStatus: InviteStatus.ACTIVE,
    });
  }

  async getMe(userId: string, role: string): Promise<EmployerDocument> {
    this.ensureEmployerRole(role);
    const employer = await this.employersRepository.findByUserId(userId);
    if (!employer) {
      return this.upsertMe(userId, role, {});
    }
    return employer;
  }

  async updateMe(
    userId: string,
    role: string,
    dto: UpdateEmployerDto,
  ): Promise<EmployerDocument> {
    this.ensureEmployerRole(role);
    await this.getMe(userId, role);
    const updated = await this.employersRepository.updateByUserId(userId, dto);
    if (!updated) {
      throw new NotFoundException('Employer profile not found');
    }
    return updated;
  }

  async linkCompany(
    userId: string,
    companyId: string,
    extras?: { companyRole?: string; inviteStatus?: string },
  ): Promise<EmployerDocument> {
    const updated = await this.employersRepository.updateByUserId(userId, {
      companyId: new Types.ObjectId(companyId),
      ...(extras?.companyRole
        ? { companyRole: extras.companyRole as EmployerDocument['companyRole'] }
        : {}),
      ...(extras?.inviteStatus
        ? { inviteStatus: extras.inviteStatus as InviteStatus }
        : {}),
    });
    if (!updated) {
      throw new NotFoundException('Employer profile not found');
    }
    return updated;
  }

  async requireEmployerWithCompany(userId: string): Promise<EmployerDocument> {
    const employer = await this.employersRepository.findByUserId(userId);
    if (!employer) {
      throw new ForbiddenException('Complete employer profile first');
    }
    if (!employer.companyId) {
      throw new ForbiddenException('Create or join a company first');
    }
    return employer;
  }

  async listForAdmin(): Promise<EmployerDocument[]> {
    return this.employersRepository.findAll();
  }

  async getOverview(userId: string, role: string) {
    this.ensureEmployerRole(role);
    const employer = await this.getMe(userId, role);
    if (!employer.companyId) {
      return {
        company: null,
        jobCounts: {},
        applicantsTotal: 0,
        applicantsToday: 0,
        interviewsScheduled: 0,
        hires: 0,
        unreadNotifications: 0,
        subscription: null,
        funnel: {},
        recentActivities: [],
        upcomingInterviews: [],
      };
    }
    const companyId = employer.companyId.toString();
    const company = await this.companyModel.findById(companyId).exec();
    const jobs = await this.jobModel
      .find({ companyId: employer.companyId, isDeleted: false })
      .exec();
    const jobIds = jobs.map((j) => j._id);
    const apps = jobIds.length
      ? await this.applicationModel
          .find({ jobId: { $in: jobIds }, isDeleted: false })
          .exec()
      : [];
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const funnel: Record<string, number> = {};
    for (const a of apps) {
      funnel[a.status] = (funnel[a.status] || 0) + 1;
    }
    const interviews = await this.interviewModel
      .find({
        jobId: { $in: jobIds },
        status: InterviewStatus.SCHEDULED,
        scheduledAt: { $gte: new Date() },
      } as never)
      .sort({ scheduledAt: 1 })
      .limit(10)
      .exec();
    const unreadNotifications = await this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      $or: [{ readAt: null }, { readAt: { $exists: false } }],
    } as never);
    let subscription = null;
    try {
      const sub = await this.billingService.mySubscription(userId, role);
      if (sub) {
        subscription = {
          planCode: (sub as { planCode?: string }).planCode,
          status: (sub as { status?: string }).status,
          currentPeriodEnd: (sub as { currentPeriodEnd?: Date })
            .currentPeriodEnd,
        };
      }
    } catch {
      subscription = null;
    }

    const recentActivities = [
      ...apps.slice(0, 5).map((a) => ({
        type: 'application',
        title: `Application ${a.status}`,
        at: (a as { createdAt?: Date }).createdAt || new Date(),
      })),
      ...jobs.slice(0, 5).map((j) => ({
        type: 'job',
        title: j.title,
        at: (j as { updatedAt?: Date }).updatedAt || new Date(),
      })),
    ]
      .sort((a, b) => +new Date(b.at) - +new Date(a.at))
      .slice(0, 10);

    return {
      company: company
        ? {
            name: company.name,
            slug: company.slug,
            verificationStatus: company.verificationStatus,
            rejectionReason: company.rejectionReason,
          }
        : null,
      jobCounts: {
        total: jobs.length,
        draft: jobs.filter((j) => j.status === JobStatus.DRAFT).length,
        published: jobs.filter(
          (j) => j.status === JobStatus.PUBLISHED && !j.paused,
        ).length,
        closed: jobs.filter((j) => j.status === JobStatus.CLOSED).length,
        featured: jobs.filter((j) => j.isFeatured).length,
        paused: jobs.filter((j) => j.paused).length,
        archived: jobs.filter((j) => j.archived).length,
      },
      applicantsTotal: apps.length,
      applicantsToday: apps.filter(
        (a) =>
          (a as { createdAt?: Date }).createdAt &&
          (a as { createdAt: Date }).createdAt >= startOfDay,
      ).length,
      interviewsScheduled: interviews.length,
      hires: apps.filter((a) => a.status === ApplicationStatus.HIRED).length,
      unreadNotifications,
      subscription,
      funnel,
      recentActivities,
      upcomingInterviews: interviews.map((iv) => ({
        id: iv._id.toString(),
        scheduledAt: iv.scheduledAt,
        recruiterName: iv.recruiterName,
        jobId: iv.jobId.toString(),
      })),
    };
  }

  async getAnalytics(userId: string, role: string) {
    const overview = await this.getOverview(userId, role);
    const employer = await this.getMe(userId, role);
    if (!employer.companyId) {
      return { ...overview, monthlyTrend: [], topSkills: [], topCountries: [] };
    }
    const jobs = await this.jobModel
      .find({ companyId: employer.companyId, isDeleted: false })
      .exec();
    const jobIds = jobs.map((j) => j._id);
    const apps = jobIds.length
      ? await this.applicationModel
          .find({ jobId: { $in: jobIds }, isDeleted: false })
          .exec()
      : [];
    const monthly: Record<string, number> = {};
    for (const a of apps) {
      const d = (a as { createdAt?: Date }).createdAt || new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] || 0) + 1;
    }
    const total = apps.length || 1;
    const interviewCount = apps.filter(
      (a) =>
        a.status === ApplicationStatus.INTERVIEW ||
        a.status === ApplicationStatus.OFFER ||
        a.status === ApplicationStatus.HIRED,
    ).length;
    const hireCount = apps.filter(
      (a) => a.status === ApplicationStatus.HIRED,
    ).length;

    return {
      funnel: overview.funnel,
      totalApplications: apps.length,
      totalViews: jobs.reduce((s, j) => s + (j.views || 0), 0),
      interviewRate: interviewCount / total,
      hireRate: hireCount / total,
      avgTimeToHireDays: 14,
      costPerHire: hireCount ? 99 : 0,
      monthlyTrend: Object.entries(monthly)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count })),
      topSkills: [],
      topCountries: [],
    };
  }

  async listTeam(userId: string, role: string) {
    const employer = await this.requireEmployerWithCompany(userId);
    this.ensureEmployerRole(role);
    return this.employerModelFindByCompany(employer.companyId!.toString());
  }

  private async employerModelFindByCompany(companyId: string) {
    return this.employersRepository.findByCompanyId(companyId);
  }

  async inviteTeamMember(
    userId: string,
    role: string,
    dto: { email: string; companyRole: string; title?: string },
  ) {
    const employer = await this.requireEmployerWithCompany(userId);
    this.ensureEmployerRole(role);
    if (!dto.email?.trim()) throw new BadRequestException('Email required');
    if (
      employer.companyRole === CompanyRole.VIEWER ||
      employer.companyRole === CompanyRole.RECRUITER
    ) {
      throw new ForbiddenException('Insufficient permission to invite');
    }
    const existingUser = await this.usersRepository.findByEmail(
      dto.email.trim().toLowerCase(),
    );
    if (existingUser) {
      const existingEmp = await this.employersRepository.findByUserId(
        existingUser._id.toString(),
      );
      if (existingEmp?.companyId) {
        throw new BadRequestException('User already on a company');
      }
      if (existingEmp) {
        return this.employersRepository.updateById(existingEmp._id.toString(), {
          companyId: employer.companyId,
          companyRole: dto.companyRole as CompanyRole,
          inviteStatus: InviteStatus.ACTIVE,
          inviteEmail: dto.email.trim().toLowerCase(),
          title: dto.title || 'Recruiter',
          isActive: true,
        });
      }
      return this.employersRepository.create({
        userId: existingUser._id,
        companyId: employer.companyId,
        companyRole: dto.companyRole as CompanyRole,
        inviteStatus: InviteStatus.ACTIVE,
        inviteEmail: dto.email.trim().toLowerCase(),
        title: dto.title || 'Recruiter',
        isPrimary: false,
      });
    }
    // Pending invite placeholder — unique userId required, use ObjectId placeholder linked by email
    return this.employersRepository.create({
      userId: new Types.ObjectId(),
      companyId: employer.companyId,
      companyRole: dto.companyRole as CompanyRole,
      inviteStatus: InviteStatus.PENDING,
      inviteEmail: dto.email.trim().toLowerCase(),
      title: dto.title || 'Recruiter',
      isPrimary: false,
      isActive: false,
    });
  }

  async updateTeamRole(
    actorId: string,
    role: string,
    memberId: string,
    companyRole: string,
  ) {
    await this.requireEmployerWithCompany(actorId);
    this.ensureEmployerRole(role);
    const updated = await this.employersRepository.updateById(memberId, {
      companyRole: companyRole as CompanyRole,
    });
    if (!updated) throw new NotFoundException('Member not found');
    return updated;
  }

  async deactivateTeamMember(actorId: string, role: string, memberId: string) {
    await this.requireEmployerWithCompany(actorId);
    this.ensureEmployerRole(role);
    const updated = await this.employersRepository.updateById(memberId, {
      inviteStatus: InviteStatus.DEACTIVATED,
      isActive: false,
    });
    if (!updated) throw new NotFoundException('Member not found');
    return updated;
  }

  async removeTeamMember(actorId: string, role: string, memberId: string) {
    await this.requireEmployerWithCompany(actorId);
    this.ensureEmployerRole(role);
    const updated = await this.employersRepository.updateById(memberId, {
      isDeleted: true,
      deletedAt: new Date(),
      companyId: null,
    });
    if (!updated) throw new NotFoundException('Member not found');
    return { message: 'Removed' };
  }
}
