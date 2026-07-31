import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { Model, Types } from 'mongoose';
import {
  ApplicationStatus,
  CompanyVerificationStatus,
  InterviewStatus,
  JobStatus,
  LearningItemType,
  WorkplaceType,
} from '../../../common/enums/domain.enum';
import { Role } from '../../../common/enums/role.enum';
import { AiRun, AiRunDocument } from '../../ai/schemas/ai-run.schema';
import {
  Application,
  ApplicationDocument,
} from '../../applications/schemas/application.schema';
import { BillingService } from '../../billing/services/billing.service';
import { Coupon, CouponDocument } from '../../billing/schemas/coupon.schema';
import {
  SubscriptionPlan,
  SubscriptionPlanDocument,
} from '../../billing/schemas/plan.schema';
import {
  RefundRequest,
  RefundRequestDocument,
} from '../../billing/schemas/refund.schema';
import {
  Subscription,
  SubscriptionDocument,
} from '../../billing/schemas/subscription.schema';
import {
  Transaction,
  TransactionDocument,
} from '../../billing/schemas/transaction.schema';
import { CompaniesService } from '../../companies/services/companies.service';
import { Company, CompanyDocument } from '../../companies/schemas/company.schema';
import { Employer, EmployerDocument } from '../../employers/schemas/employer.schema';
import {
  Interview,
  InterviewDocument,
} from '../../interviews/schemas/interview.schema';
import { Job, JobDocument } from '../../jobs/schemas/job.schema';
import {
  LearningItem,
  LearningItemDocument,
} from '../../learning/schemas/learning-item.schema';
import { NotificationsService } from '../../notifications/services/notifications.service';
import {
  SupportTicket,
  SupportTicketDocument,
} from '../../support/schemas/support-ticket.schema';
import { UsersService } from '../../users/services/users.service';
import { User, UserDocument } from '../../users/schemas/user.schema';
import {
  AdminBlogPostDto,
  AdminBroadcastDto,
  AdminCmsPageDto,
  AdminCompaniesQueryDto,
  AdminCouponDto,
  AdminFlagJobDto,
  AdminJobPatchDto,
  AdminLearningItemDto,
  AdminListQueryDto,
  AdminPlanDto,
  AdminRejectCompanyDto,
  AdminRequestInfoDto,
  AdminSettingsPatchDto,
  AdminTicketUpdateDto,
} from '../dto/admin.dto';
import { AdminAction, AdminActionDocument } from '../schemas/admin-action.schema';
import {
  BlogPost,
  BlogPostDocument,
  CmsPage,
  CmsPageDocument,
} from '../schemas/cms-page.schema';
import {
  PlatformSettings,
  PlatformSettingsDocument,
} from '../schemas/platform-settings.schema';

const RBAC_MATRIX: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'users.manage',
    'companies.verify',
    'jobs.moderate',
    'applications.read',
    'support.manage',
    'cms.manage',
    'reports.read',
    'settings.read',
    'broadcast.send',
    'ai.read',
  ],
  // Ops FE nav lives under /dashboard/ops; API access mirrors these actions
  // via method-level @Roles on AdminController (MOD / SUPPORT / FINANCE / MARKETING).
  MODERATOR: ['companies.verify', 'jobs.moderate', 'applications.read'],
  SUPPORT_AGENT: ['support.manage', 'users.read'],
  FINANCE_MANAGER: [
    'billing.refund',
    'billing.plans',
    'revenue.read',
    'transactions.read',
  ],
  MARKETING_MANAGER: ['broadcast.send', 'cms.manage', 'referrals.read'],
  EMPLOYER: [],
  RECRUITER: [],
  JOB_SEEKER: [],
};

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Company.name)
    private readonly companyModel: Model<CompanyDocument>,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(RefundRequest.name)
    private readonly refundModel: Model<RefundRequestDocument>,
    @InjectModel(AdminAction.name)
    private readonly actionModel: Model<AdminActionDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(SubscriptionPlan.name)
    private readonly planModel: Model<SubscriptionPlanDocument>,
    @InjectModel(Coupon.name) private readonly couponModel: Model<CouponDocument>,
    @InjectModel(Interview.name)
    private readonly interviewModel: Model<InterviewDocument>,
    @InjectModel(SupportTicket.name)
    private readonly ticketModel: Model<SupportTicketDocument>,
    @InjectModel(AiRun.name) private readonly aiRunModel: Model<AiRunDocument>,
    @InjectModel(Employer.name)
    private readonly employerModel: Model<EmployerDocument>,
    @InjectModel(PlatformSettings.name)
    private readonly settingsModel: Model<PlatformSettingsDocument>,
    @InjectModel(CmsPage.name)
    private readonly cmsPageModel: Model<CmsPageDocument>,
    @InjectModel(BlogPost.name)
    private readonly blogPostModel: Model<BlogPostDocument>,
    @InjectModel(LearningItem.name)
    private readonly learningModel: Model<LearningItemDocument>,
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
    private readonly billingService: BillingService,
    private readonly notificationsService: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const existing = await this.settingsModel.findOne({ key: 'default' }).exec();
    if (!existing) {
      await this.settingsModel.create({
        key: 'default',
        platformName: 'NaijaJobber',
        featureFlags: { jobModerationRequired: false },
        localization: { defaultLocale: 'en', defaultCurrency: 'USD' },
        security: { passwordMinLength: 8, jwtTtlDays: 7 },
        aiPrompts: {
          resumeReview: 'Review this resume for clarity and impact.',
          coverLetter: 'Draft a concise cover letter.',
          jobMatch: 'Score candidate fit for the role.',
        },
      });
    }
  }

  private paginate(
    items: unknown[],
    total: number,
    page: number,
    limit: number,
  ) {
    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      message: 'OK',
    };
  }

  private monthBuckets(months = 6) {
    const buckets: { key: string; start: Date; end: Date }[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      buckets.push({
        key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
        start,
        end,
      });
    }
    return buckets;
  }

  async overview() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );
    const dauSince = new Date(Date.now() - 86400000);
    const mauSince = new Date(Date.now() - 30 * 86400000);

    const [
      users,
      employers,
      companiesPending,
      companiesVerified,
      companiesRejected,
      companiesRequestInfo,
      jobsDraft,
      jobsPublished,
      jobsClosed,
      applications7d,
      revenueAgg,
      interviewsScheduled,
      hires,
      activeSubscriptions,
      monthlyRevenueAgg,
      openSupportTickets,
      aiRunsToday,
      dau,
      mau,
      recentActivities,
    ] = await Promise.all([
      this.userModel.countDocuments({ isDeleted: false }),
      this.employerModel.countDocuments({ isDeleted: false, isActive: true }),
      this.companyModel.countDocuments({
        verificationStatus: CompanyVerificationStatus.PENDING,
        isDeleted: false,
      }),
      this.companyModel.countDocuments({
        verificationStatus: CompanyVerificationStatus.VERIFIED,
        isDeleted: false,
      }),
      this.companyModel.countDocuments({
        verificationStatus: CompanyVerificationStatus.REJECTED,
        isDeleted: false,
      }),
      this.companyModel.countDocuments({
        verificationStatus: CompanyVerificationStatus.REQUEST_INFO,
        isDeleted: false,
      }),
      this.jobModel.countDocuments({ status: JobStatus.DRAFT, isDeleted: false }),
      this.jobModel.countDocuments({
        status: JobStatus.PUBLISHED,
        isDeleted: false,
      }),
      this.jobModel.countDocuments({ status: JobStatus.CLOSED, isDeleted: false }),
      this.applicationModel.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      }),
      this.transactionModel.aggregate([
        { $match: { status: 'SUCCESS' } },
        { $group: { _id: '$currency', total: { $sum: '$amount' } } },
      ]),
      this.interviewModel.countDocuments({
        status: InterviewStatus.SCHEDULED,
        scheduledAt: { $gte: new Date() },
      }),
      this.applicationModel.countDocuments({ status: ApplicationStatus.HIRED }),
      this.subscriptionModel.countDocuments({ status: 'ACTIVE' }),
      this.transactionModel.aggregate([
        {
          $match: {
            status: 'SUCCESS',
            createdAt: { $gte: monthStart },
          },
        },
        { $group: { _id: '$currency', total: { $sum: '$amount' } } },
      ]),
      this.ticketModel.countDocuments({
        status: { $in: ['OPEN', 'IN_PROGRESS'] },
      }),
      this.aiRunModel.countDocuments({ createdAt: { $gte: dayStart } }),
      this.userModel.countDocuments({
        isDeleted: false,
        lastLoginAt: { $gte: dauSince },
      }),
      this.userModel.countDocuments({
        isDeleted: false,
        lastLoginAt: { $gte: mauSince },
      }),
      this.actionModel.find().sort({ createdAt: -1 }).limit(20).exec(),
    ]);

    const buckets = this.monthBuckets(6);
    const monthlyTrends = await Promise.all(
      buckets.map(async (b) => {
        const [usersCreated, jobsCreated, appsCreated] = await Promise.all([
          this.userModel.countDocuments({
            createdAt: { $gte: b.start, $lt: b.end },
          }),
          this.jobModel.countDocuments({
            createdAt: { $gte: b.start, $lt: b.end },
          }),
          this.applicationModel.countDocuments({
            createdAt: { $gte: b.start, $lt: b.end },
          }),
        ]);
        return {
          month: b.key,
          users: usersCreated,
          jobs: jobsCreated,
          applications: appsCreated,
        };
      }),
    );

    return {
      users,
      employers,
      companies: {
        pending: companiesPending,
        verified: companiesVerified,
        rejected: companiesRejected,
        requestInfo: companiesRequestInfo,
      },
      jobs: {
        draft: jobsDraft,
        published: jobsPublished,
        closed: jobsClosed,
      },
      applicationsLast7Days: applications7d,
      revenue: revenueAgg,
      interviewsScheduled,
      hires,
      activeSubscriptions,
      monthlyRevenue: monthlyRevenueAgg,
      openSupportTickets,
      aiRunsToday,
      dau,
      mau,
      recentActivities,
      monthlyTrends,
    };
  }

  async listUsers(query: AdminListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const filter: Record<string, unknown> = { isDeleted: false };
    if (query.q) {
      filter.$or = [
        { email: new RegExp(query.q, 'i') },
        { firstName: new RegExp(query.q, 'i') },
        { lastName: new RegExp(query.q, 'i') },
      ];
    }
    if (query.role) filter.role = query.role;
    if (query.status === 'active') filter.isActive = true;
    if (query.status === 'suspended') filter.isActive = false;
    if (query.country) filter.country = new RegExp(query.country, 'i');
    if (query.dateFrom || query.dateTo) {
      filter.createdAt = {
        ...(query.dateFrom ? { $gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { $lte: new Date(query.dateTo) } : {}),
      };
    }
    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password -refreshTokenHash -emailVerificationToken -passwordResetToken')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter),
    ]);
    return this.paginate(items, total, page, limit);
  }

  async updateUserRole(actorId: string, userId: string, role: Role) {
    const updated = await this.usersService.updateRole(userId, { role });
    await this.audit(actorId, 'USER_ROLE_UPDATE', 'user', userId, { role });
    return updated;
  }

  async softDeleteUser(actorId: string, userId: string) {
    await this.usersService.softDelete(userId);
    await this.audit(actorId, 'USER_SOFT_DELETE', 'user', userId, {});
    return { message: 'Deleted' };
  }

  async suspendUser(actorId: string, userId: string) {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: userId, isDeleted: false },
        { isActive: false },
        { returnDocument: 'after' },
      )
      .exec();
    if (!user) throw new NotFoundException('User not found');
    await this.audit(actorId, 'USER_SUSPEND', 'user', userId, {});
    return user;
  }

  async reactivateUser(actorId: string, userId: string) {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: userId, isDeleted: false },
        { isActive: true },
        { returnDocument: 'after' },
      )
      .exec();
    if (!user) throw new NotFoundException('User not found');
    await this.audit(actorId, 'USER_REACTIVATE', 'user', userId, {});
    return user;
  }

  async forceVerifyEmail(actorId: string, userId: string) {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: userId, isDeleted: false },
        {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
        { returnDocument: 'after' },
      )
      .exec();
    if (!user) throw new NotFoundException('User not found');
    await this.audit(actorId, 'USER_FORCE_VERIFY_EMAIL', 'user', userId, {});
    return user;
  }

  async resetUserPassword(actorId: string, userId: string) {
    const tempPassword = `Temp${randomBytes(4).toString('hex')}A1!`;
    const hashed = await bcrypt.hash(tempPassword, 12);
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: userId, isDeleted: false },
        {
          password: hashed,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
        { returnDocument: 'after' },
      )
      .exec();
    if (!user) throw new NotFoundException('User not found');
    await this.audit(actorId, 'USER_RESET_PASSWORD', 'user', userId, {
      mockEmail: true,
    });
    return {
      message: 'Temporary password set (mock email logged)',
      tempPassword,
      email: user.email,
    };
  }

  async listCompanies(query: AdminCompaniesQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const filter: Record<string, unknown> = { isDeleted: false };
    if (query.status) filter.verificationStatus = query.status;
    if (query.q) filter.name = new RegExp(query.q, 'i');
    const [items, total] = await Promise.all([
      this.companyModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.companyModel.countDocuments(filter),
    ]);
    return this.paginate(items, total, page, limit);
  }

  async verifyCompany(actorId: string, companyId: string) {
    const company = await this.companiesService.verify(companyId);
    await this.audit(actorId, 'COMPANY_VERIFY', 'company', companyId, {});
    return company;
  }

  async rejectCompany(
    actorId: string,
    companyId: string,
    dto: AdminRejectCompanyDto,
  ) {
    const company = await this.companiesService.reject(
      companyId,
      dto.reason || '',
    );
    await this.audit(actorId, 'COMPANY_REJECT', 'company', companyId, {
      reason: dto.reason || '',
    });
    try {
      await this.notificationsService.notify({
        userId: company.createdByUserId.toString(),
        type: 'VERIFICATION',
        title: 'Company verification rejected',
        body: dto.reason || 'Please update documents and resubmit.',
        data: { companyId },
      });
    } catch {
      /* ignore */
    }
    return company;
  }

  async requestCompanyInfo(
    actorId: string,
    companyId: string,
    dto: AdminRequestInfoDto,
  ) {
    const company = await this.companyModel
      .findOneAndUpdate(
        { _id: companyId, isDeleted: false },
        {
          verificationStatus: CompanyVerificationStatus.REQUEST_INFO,
          $push: {
            verificationNotes: {
              note: dto.note,
              byUserId: new Types.ObjectId(actorId),
              at: new Date(),
            },
          },
        },
        { returnDocument: 'after' },
      )
      .exec();
    if (!company) throw new NotFoundException('Company not found');
    await this.audit(actorId, 'COMPANY_REQUEST_INFO', 'company', companyId, {
      note: dto.note,
    });
    try {
      await this.notificationsService.notify({
        userId: company.createdByUserId.toString(),
        type: 'VERIFICATION',
        title: 'More information requested',
        body: dto.note,
        data: { companyId },
      });
    } catch {
      /* ignore */
    }
    return company;
  }

  async assignCompanyModerator(
    actorId: string,
    companyId: string,
    moderatorUserId: string,
  ) {
    const company = await this.companyModel
      .findOneAndUpdate(
        { _id: companyId, isDeleted: false },
        { assignedModeratorUserId: new Types.ObjectId(moderatorUserId) },
        { returnDocument: 'after' },
      )
      .exec();
    if (!company) throw new NotFoundException('Company not found');
    await this.audit(actorId, 'COMPANY_ASSIGN_MODERATOR', 'company', companyId, {
      moderatorUserId,
    });
    return company;
  }

  async listEmployers(query: AdminListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const filter: Record<string, unknown> = { isDeleted: false };
    if (query.status === 'inactive') filter.isActive = false;
    if (query.status === 'active') filter.isActive = true;
    const [items, total] = await Promise.all([
      this.employerModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.employerModel.countDocuments(filter),
    ]);

    const enriched = await Promise.all(
      items.map(async (emp) => {
        const companyId = emp.companyId?.toString();
        const [jobsPosted, company, sub] = await Promise.all([
          companyId
            ? this.jobModel.countDocuments({
                companyId: emp.companyId,
                isDeleted: false,
              })
            : Promise.resolve(0),
          companyId
            ? this.companyModel.findById(companyId).lean().exec()
            : Promise.resolve(null),
          this.subscriptionModel
            .findOne({
              userId: emp.userId,
              status: 'ACTIVE',
            })
            .lean()
            .exec(),
        ]);
        return {
          ...emp,
          jobsPosted,
          verificationStatus: company?.verificationStatus || null,
          companyName: company?.name || null,
          planCode: sub?.planCode || null,
        };
      }),
    );
    return this.paginate(enriched, total, page, limit);
  }

  async listJobs(query: AdminListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const filter: Record<string, unknown> = { isDeleted: false };
    if (query.q) filter.title = new RegExp(query.q, 'i');
    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;
    if (query.companyId) filter.companyId = new Types.ObjectId(query.companyId);
    const [items, total] = await Promise.all([
      this.jobModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.jobModel.countDocuments(filter),
    ]);
    return this.paginate(items, total, page, limit);
  }

  async unpublishJob(actorId: string, jobId: string) {
    return this.patchJobStatus(actorId, jobId, JobStatus.CLOSED, 'JOB_UNPUBLISH');
  }

  async approvePublishJob(actorId: string, jobId: string) {
    const job = await this.jobModel
      .findOneAndUpdate(
        { _id: jobId, isDeleted: false },
        {
          status: JobStatus.PUBLISHED,
          publishedAt: new Date(),
          flagged: false,
          paused: false,
        },
        { returnDocument: 'after' },
      )
      .exec();
    if (!job) throw new NotFoundException('Job not found');
    await this.audit(actorId, 'JOB_APPROVE_PUBLISH', 'job', jobId, {});
    return job;
  }

  async flagJob(actorId: string, jobId: string, dto: AdminFlagJobDto) {
    const job = await this.jobModel
      .findOneAndUpdate(
        { _id: jobId, isDeleted: false },
        { flagged: true, flagReason: dto.reason || 'Flagged by admin' },
        { returnDocument: 'after' },
      )
      .exec();
    if (!job) throw new NotFoundException('Job not found');
    await this.audit(actorId, 'JOB_FLAG', 'job', jobId, {
      reason: dto.reason,
    });
    return job;
  }

  async featureJob(actorId: string, jobId: string, featured: boolean) {
    const job = await this.jobModel
      .findOneAndUpdate(
        { _id: jobId, isDeleted: false },
        {
          isFeatured: featured,
          featuredUntil: featured
            ? new Date(Date.now() + 30 * 86400000)
            : null,
        },
        { returnDocument: 'after' },
      )
      .exec();
    if (!job) throw new NotFoundException('Job not found');
    await this.audit(actorId, 'JOB_FEATURE', 'job', jobId, { featured });
    return job;
  }

  async sponsorJob(actorId: string, jobId: string, sponsored: boolean) {
    const job = await this.jobModel
      .findOneAndUpdate(
        { _id: jobId, isDeleted: false },
        { isSponsored: sponsored },
        { returnDocument: 'after' },
      )
      .exec();
    if (!job) throw new NotFoundException('Job not found');
    await this.audit(actorId, 'JOB_SPONSOR', 'job', jobId, { sponsored });
    return job;
  }

  async pauseJob(actorId: string, jobId: string, paused: boolean) {
    const job = await this.jobModel
      .findOneAndUpdate(
        { _id: jobId, isDeleted: false },
        { paused },
        { returnDocument: 'after' },
      )
      .exec();
    if (!job) throw new NotFoundException('Job not found');
    await this.audit(actorId, 'JOB_PAUSE', 'job', jobId, { paused });
    return job;
  }

  async closeJob(actorId: string, jobId: string) {
    return this.patchJobStatus(actorId, jobId, JobStatus.CLOSED, 'JOB_CLOSE');
  }

  async archiveJob(actorId: string, jobId: string) {
    const job = await this.jobModel
      .findOneAndUpdate(
        { _id: jobId, isDeleted: false },
        { archived: true, status: JobStatus.CLOSED },
        { returnDocument: 'after' },
      )
      .exec();
    if (!job) throw new NotFoundException('Job not found');
    await this.audit(actorId, 'JOB_ARCHIVE', 'job', jobId, {});
    return job;
  }

  async duplicateJob(actorId: string, jobId: string) {
    const job = await this.jobModel.findOne({ _id: jobId, isDeleted: false }).exec();
    if (!job) throw new NotFoundException('Job not found');
    const slug = `${job.slug}-copy-${randomBytes(3).toString('hex')}`;
    const copy = await this.jobModel.create({
      ...job.toObject(),
      _id: undefined,
      slug,
      title: `${job.title} (Copy)`,
      status: JobStatus.DRAFT,
      publishedAt: null,
      createdAt: undefined,
      updatedAt: undefined,
    });
    await this.audit(actorId, 'JOB_DUPLICATE', 'job', copy._id.toString(), {
      from: jobId,
    });
    return copy;
  }

  async softDeleteJob(actorId: string, jobId: string) {
    const job = await this.jobModel
      .findOneAndUpdate(
        { _id: jobId, isDeleted: false },
        { isDeleted: true, deletedAt: new Date() },
        { returnDocument: 'after' },
      )
      .exec();
    if (!job) throw new NotFoundException('Job not found');
    await this.audit(actorId, 'JOB_SOFT_DELETE', 'job', jobId, {});
    return { message: 'Deleted' };
  }

  async patchJob(actorId: string, jobId: string, dto: AdminJobPatchDto) {
    const job = await this.jobModel
      .findOneAndUpdate(
        { _id: jobId, isDeleted: false },
        { $set: dto },
        { returnDocument: 'after' },
      )
      .exec();
    if (!job) throw new NotFoundException('Job not found');
    await this.audit(actorId, 'JOB_PATCH', 'job', jobId, { ...dto });
    return job;
  }

  async listJobApplicants(jobId: string, query: AdminListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const filter: Record<string, unknown> = {
      jobId: new Types.ObjectId(jobId),
    };
    if (query.status) filter.status = query.status;
    const [items, total] = await Promise.all([
      this.applicationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.applicationModel.countDocuments(filter),
    ]);
    return this.paginate(items, total, page, limit);
  }

  private async patchJobStatus(
    actorId: string,
    jobId: string,
    status: JobStatus,
    action: string,
  ) {
    const job = await this.jobModel
      .findOneAndUpdate(
        { _id: jobId, isDeleted: false },
        { status },
        { returnDocument: 'after' },
      )
      .exec();
    if (!job) throw new NotFoundException('Job not found');
    await this.audit(actorId, action, 'job', jobId, { status });
    return job;
  }

  async listApplications(query: AdminListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.country) filter.country = new RegExp(query.country, 'i');
    if (query.dateFrom || query.dateTo) {
      filter.createdAt = {
        ...(query.dateFrom ? { $gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { $lte: new Date(query.dateTo) } : {}),
      };
    }
    if (query.employerId) {
      const emp = await this.employerModel.findById(query.employerId).exec();
      if (emp?.companyId) {
        const jobs = await this.jobModel
          .find({ companyId: emp.companyId })
          .select('_id')
          .exec();
        filter.jobId = { $in: jobs.map((j) => j._id) };
      }
    }
    if (query.companyId) {
      const jobs = await this.jobModel
        .find({ companyId: new Types.ObjectId(query.companyId) })
        .select('_id')
        .exec();
      filter.jobId = { $in: jobs.map((j) => j._id) };
    }
    const [items, total] = await Promise.all([
      this.applicationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.applicationModel.countDocuments(filter),
    ]);
    return this.paginate(items, total, page, limit);
  }

  async listTransactions(query: AdminListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const [items, total] = await Promise.all([
      this.transactionModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.transactionModel.countDocuments(),
    ]);
    return this.paginate(items, total, page, limit);
  }

  async listRefunds(query: AdminListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const [items, total] = await Promise.all([
      this.refundModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.refundModel.countDocuments(),
    ]);
    return this.paginate(items, total, page, limit);
  }

  async reviewRefund(
    actorId: string,
    id: string,
    status: 'APPROVED' | 'REJECTED',
  ) {
    const refund = await this.billingService.reviewRefund(id, { status });
    await this.audit(actorId, 'REFUND_REVIEW', 'refund', id, { status });
    return refund;
  }

  async retryMarkTransaction(actorId: string, id: string) {
    const tx = await this.transactionModel
      .findOneAndUpdate(
        { _id: id },
        { status: 'SUCCESS' },
        { returnDocument: 'after' },
      )
      .exec();
    if (!tx) throw new NotFoundException('Transaction not found');
    await this.audit(actorId, 'TX_RETRY_MARK_SUCCESS', 'transaction', id, {});
    return tx;
  }

  async listPlans() {
    const plans = await this.planModel.find().sort({ price: 1 }).exec();
    return { data: plans, meta: null, message: 'OK' };
  }

  async upsertPlan(actorId: string, dto: AdminPlanDto) {
    const plan = await this.planModel
      .findOneAndUpdate(
        { code: dto.code.toUpperCase() },
        {
          $set: {
            name: dto.name,
            price: dto.price,
            currency: dto.currency || 'USD',
            interval: dto.interval || 'month',
            features: dto.features || [],
            isActive: dto.isActive ?? true,
            isOneOff: dto.isOneOff ?? false,
          },
          $setOnInsert: { code: dto.code.toUpperCase() },
        },
        { upsert: true, returnDocument: 'after' },
      )
      .exec();
    await this.audit(actorId, 'PLAN_UPSERT', 'plan', plan!.code, { ...dto });
    return plan;
  }

  async listCoupons() {
    const coupons = await this.couponModel.find().sort({ createdAt: -1 }).exec();
    return { data: coupons, meta: null, message: 'OK' };
  }

  async createCoupon(actorId: string, dto: AdminCouponDto) {
    const coupon = await this.couponModel.create({
      code: dto.code.toUpperCase(),
      percentOff: dto.percentOff ?? null,
      amountOff: dto.amountOff ?? null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      maxRedemptions: dto.maxRedemptions ?? 100,
    });
    await this.audit(actorId, 'COUPON_CREATE', 'coupon', coupon._id.toString(), {
      code: coupon.code,
    });
    return coupon;
  }

  async revenueAnalytics() {
    const buckets = this.monthBuckets(12);
    const monthly = await Promise.all(
      buckets.map(async (b) => {
        const agg = await this.transactionModel.aggregate([
          {
            $match: {
              status: 'SUCCESS',
              createdAt: { $gte: b.start, $lt: b.end },
            },
          },
          {
            $group: {
              _id: { currency: '$currency', purpose: '$purpose' },
              total: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
        ]);
        return { month: b.key, buckets: agg };
      }),
    );
    const byPlan = await this.subscriptionModel.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { _id: '$planCode', count: { $sum: 1 } } },
    ]);
    const byCurrency = await this.transactionModel.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $group: { _id: '$currency', total: { $sum: '$amount' } } },
    ]);
    return { monthly, byPlan, byCurrency };
  }

  async listAudit(query: AdminListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const [items, total] = await Promise.all([
      this.actionModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.actionModel.countDocuments(),
    ]);
    return this.paginate(items, total, page, limit);
  }

  getRbacMatrix() {
    return { data: RBAC_MATRIX, meta: null, message: 'OK' };
  }

  async listSupportTickets(query: AdminListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.q) filter.subject = new RegExp(query.q, 'i');
    const [items, total] = await Promise.all([
      this.ticketModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.ticketModel.countDocuments(filter),
    ]);
    return this.paginate(items, total, page, limit);
  }

  async updateSupportTicket(
    actorId: string,
    id: string,
    dto: AdminTicketUpdateDto,
  ) {
    const update: Record<string, unknown> = {};
    if (dto.status) update.status = dto.status;
    if (dto.assignedAgentId) {
      update.assignedAgentId = new Types.ObjectId(dto.assignedAgentId);
    }
    const push: Record<string, unknown> = {};
    if (dto.note) {
      push.notes = {
        note: dto.note,
        byUserId: new Types.ObjectId(actorId),
        at: new Date(),
        internal: true,
      };
    }
    const ticket = await this.ticketModel
      .findOneAndUpdate(
        { _id: id },
        {
          ...(Object.keys(update).length ? { $set: update } : {}),
          ...(Object.keys(push).length ? { $push: push } : {}),
        },
        { returnDocument: 'after' },
      )
      .exec();
    if (!ticket) throw new NotFoundException('Ticket not found');
    await this.audit(actorId, 'SUPPORT_TICKET_UPDATE', 'support_ticket', id, {
      ...dto,
    });
    return ticket;
  }

  async referralsAdmin() {
    const leaderboard = await this.userModel
      .find({ isDeleted: false, referralRegistrations: { $gt: 0 } })
      .select(
        'email firstName lastName referralCode referralClicks referralRegistrations referralEarnings',
      )
      .sort({ referralRegistrations: -1 })
      .limit(50)
      .lean()
      .exec();
    const totals = await this.userModel.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          clicks: { $sum: '$referralClicks' },
          registrations: { $sum: '$referralRegistrations' },
          earnings: { $sum: '$referralEarnings' },
        },
      },
    ]);
    const fraudFlags = leaderboard
      .filter((u) => (u.referralRegistrations || 0) > 50)
      .map((u) => ({
        userId: u._id,
        reason: 'High referral registrations (mock fraud heuristic)',
        registrations: u.referralRegistrations,
      }));
    return {
      totals: totals[0] || { clicks: 0, registrations: 0, earnings: 0 },
      leaderboard,
      fraudFlags,
    };
  }

  async broadcast(actorId: string, dto: AdminBroadcastDto) {
    const roleMap: Record<string, Role[]> = {
      ALL: Object.values(Role),
      EMPLOYERS: [Role.EMPLOYER, Role.RECRUITER],
      JOB_SEEKERS: [Role.JOB_SEEKER],
      RECRUITERS: [Role.RECRUITER],
    };
    const roles = roleMap[dto.audience.toUpperCase()] || roleMap.ALL;
    const users = await this.userModel
      .find({ isDeleted: false, isActive: true, role: { $in: roles } })
      .select('_id')
      .limit(5000)
      .exec();

    let created = 0;
    for (const u of users) {
      try {
        await this.notificationsService.notify({
          userId: u._id.toString(),
          type: 'BROADCAST',
          title: dto.title,
          body: dto.body,
          data: {
            channels: dto.channels || ['in_app'],
            scheduleAt: dto.scheduleAt || null,
          },
        });
        created += 1;
      } catch {
        /* ignore per-user failures */
      }
    }
    await this.audit(actorId, 'NOTIFICATION_BROADCAST', 'notification', 'bulk', {
      audience: dto.audience,
      created,
      title: dto.title,
    });
    return { message: 'Broadcast queued (in-app)', created };
  }

  async listCmsPages() {
    const pages = await this.cmsPageModel.find().sort({ updatedAt: -1 }).exec();
    return { data: pages, meta: null, message: 'OK' };
  }

  async upsertCmsPage(actorId: string, dto: AdminCmsPageDto, id?: string) {
    let page: CmsPageDocument | null;
    if (id) {
      page = await this.cmsPageModel
        .findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after' })
        .exec();
    } else {
      page = await this.cmsPageModel.create(dto);
    }
    if (!page) throw new NotFoundException('CMS page not found');
    await this.audit(
      actorId,
      id ? 'CMS_PAGE_UPDATE' : 'CMS_PAGE_CREATE',
      'cms_page',
      page._id.toString(),
      { slug: page.slug },
    );
    return page;
  }

  async deleteCmsPage(actorId: string, id: string) {
    await this.cmsPageModel.findByIdAndDelete(id).exec();
    await this.audit(actorId, 'CMS_PAGE_DELETE', 'cms_page', id, {});
    return { message: 'Deleted' };
  }

  async listBlogPosts() {
    const posts = await this.blogPostModel.find().sort({ updatedAt: -1 }).exec();
    return { data: posts, meta: null, message: 'OK' };
  }

  async upsertBlogPost(actorId: string, dto: AdminBlogPostDto, id?: string) {
    const payload: Record<string, unknown> = {
      slug: dto.slug,
      title: dto.title,
      bodyMarkdown: dto.bodyMarkdown || '',
      excerpt: dto.excerpt || '',
      status: dto.status || 'DRAFT',
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
    };
    if (dto.status === 'PUBLISHED') {
      payload.publishedAt = new Date();
    }
    let post: BlogPostDocument | null;
    if (id) {
      post = await this.blogPostModel
        .findByIdAndUpdate(id, { $set: payload }, { returnDocument: 'after' })
        .exec();
    } else {
      post = await this.blogPostModel.create(payload);
    }
    if (!post) throw new NotFoundException('Blog post not found');
    await this.audit(
      actorId,
      id ? 'BLOG_UPDATE' : 'BLOG_CREATE',
      'blog_post',
      post._id.toString(),
      { slug: post.slug },
    );
    return post;
  }

  async deleteBlogPost(actorId: string, id: string) {
    await this.blogPostModel.findByIdAndDelete(id).exec();
    await this.audit(actorId, 'BLOG_DELETE', 'blog_post', id, {});
    return { message: 'Deleted' };
  }

  async listLearningAdmin() {
    const items = await this.learningModel.find().sort({ createdAt: -1 }).exec();
    return { data: items, meta: null, message: 'OK' };
  }

  async createLearningItem(actorId: string, dto: AdminLearningItemDto) {
    const type =
      (dto.type as LearningItemType) || LearningItemType.ARTICLE;
    const item = await this.learningModel.create({
      title: dto.title,
      type,
      body: dto.body,
      tags: dto.tags || [],
    });
    await this.audit(
      actorId,
      'LEARNING_CREATE',
      'learning_item',
      item._id.toString(),
      {},
    );
    return item;
  }

  async updateLearningItem(
    actorId: string,
    id: string,
    dto: AdminLearningItemDto,
  ) {
    const type =
      (dto.type as LearningItemType) || LearningItemType.ARTICLE;
    const item = await this.learningModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            title: dto.title,
            type,
            body: dto.body,
            tags: dto.tags || [],
          },
        },
        { returnDocument: 'after' },
      )
      .exec();
    if (!item) throw new NotFoundException('Learning item not found');
    await this.audit(actorId, 'LEARNING_UPDATE', 'learning_item', id, {});
    return item;
  }

  async deleteLearningItem(actorId: string, id: string) {
    await this.learningModel.findByIdAndDelete(id).exec();
    await this.audit(actorId, 'LEARNING_DELETE', 'learning_item', id, {});
    return { message: 'Deleted' };
  }

  async impact() {
    const [
      seekers,
      remoteJobs,
      hires,
      verifiedEmployers,
      countries,
      women,
      youth,
    ] = await Promise.all([
      this.userModel.countDocuments({
        role: Role.JOB_SEEKER,
        isDeleted: false,
      }),
      this.jobModel.countDocuments({
        workplaceType: WorkplaceType.REMOTE,
        isDeleted: false,
        status: JobStatus.PUBLISHED,
      }),
      this.applicationModel.countDocuments({ status: ApplicationStatus.HIRED }),
      this.companyModel.countDocuments({
        verificationStatus: CompanyVerificationStatus.VERIFIED,
        isDeleted: false,
      }),
      this.userModel.distinct('country', {
        isDeleted: false,
        country: { $nin: ['', null] },
      }),
      this.userModel.countDocuments({
        isDeleted: false,
        gender: { $regex: /^f/i },
      }),
      this.userModel.countDocuments({
        isDeleted: false,
        dateOfBirth: {
          $gte: new Date(new Date().getFullYear() - 35, 0, 1),
        },
      }),
    ]);
    return {
      seekers,
      remoteJobs,
      hires,
      verifiedEmployers,
      countries: countries.length,
      women,
      youth,
      provisional: {
        women: 'Based on optional gender field',
        youth: 'Based on optional dateOfBirth under 35',
      },
    };
  }

  async report(type: string, format: 'json' | 'csv' = 'json') {
    let rows: Record<string, unknown>[] = [];
    switch (type) {
      case 'users':
        rows = (await this.userModel
          .find({ isDeleted: false })
          .select('email firstName lastName role country isActive createdAt')
          .lean()
          .exec()) as unknown as Record<string, unknown>[];
        break;
      case 'employers':
        rows = (await this.employerModel
          .find({ isDeleted: false })
          .lean()
          .exec()) as unknown as Record<string, unknown>[];
        break;
      case 'jobs':
        rows = (await this.jobModel
          .find({ isDeleted: false })
          .select('title status category companyId createdAt')
          .lean()
          .exec()) as unknown as Record<string, unknown>[];
        break;
      case 'applications':
        rows = (await this.applicationModel
          .find()
          .select('jobId applicantUserId status createdAt')
          .lean()
          .exec()) as unknown as Record<string, unknown>[];
        break;
      case 'revenue':
        rows = (await this.transactionModel
          .find({ status: 'SUCCESS' })
          .select('amount currency purpose reference createdAt')
          .lean()
          .exec()) as unknown as Record<string, unknown>[];
        break;
      case 'support':
        rows = (await this.ticketModel
          .find()
          .select('subject category status userId createdAt')
          .lean()
          .exec()) as unknown as Record<string, unknown>[];
        break;
      default:
        throw new BadRequestException(
          'Unknown report type. Use users|employers|jobs|applications|revenue|support',
        );
    }

    if (format === 'csv') {
      if (!rows.length) return { format: 'csv', csv: '', rows: 0 };
      const keys = Object.keys(rows[0]);
      const lines = [
        keys.join(','),
        ...rows.map((r) =>
          keys
            .map((k) => {
              const v = r[k];
              const s =
                v == null
                  ? ''
                  : typeof v === 'object'
                    ? JSON.stringify(v)
                    : String(v);
              return `"${s.replace(/"/g, '""')}"`;
            })
            .join(','),
        ),
      ];
      return { format: 'csv', csv: lines.join('\n'), rows: rows.length };
    }
    return { format: 'json', data: rows, rows: rows.length };
  }

  async aiUsage() {
    const byType = await this.aiRunModel.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          errors: {
            $sum: { $cond: [{ $ne: ['$status', 'SUCCESS'] }, 1, 0] },
          },
          avgTokens: { $avg: '$tokensUsed' },
        },
      },
    ]);
    const settings = await this.getSettings();
    return {
      byType,
      aiMode: this.config.get<string>('ai.mode') || 'mock',
      rateLimits: {
        note: 'Configured via env; mock mode has no live LLM calls',
      },
      prompts: settings.aiPrompts,
    };
  }

  async getSettings() {
    let doc = await this.settingsModel.findOne({ key: 'default' }).exec();
    if (!doc) {
      doc = await this.settingsModel.create({ key: 'default' });
    }
    return {
      ...doc.toObject(),
      apiKeys: (doc.apiKeys || []).map((k) => ({
        id: k.id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        createdAt: k.createdAt,
        revokedAt: k.revokedAt,
      })),
      envConfigured: {
        smtp: Boolean(this.config.get('mail.host')),
        oauthGoogle: Boolean(this.config.get('oauth.googleClientId')),
        payments: this.config.get<string>('payment.mode') || 'mock',
        ai: this.config.get<string>('ai.mode') || 'mock',
      },
    };
  }

  async patchSettings(actorId: string, dto: AdminSettingsPatchDto) {
    const doc = await this.settingsModel
      .findOneAndUpdate(
        { key: 'default' },
        { $set: dto },
        { returnDocument: 'after', upsert: true },
      )
      .exec();
    await this.audit(actorId, 'SETTINGS_PATCH', 'platform_settings', 'default', {
      keys: Object.keys(dto),
    });
    return this.getSettings();
  }

  async generateApiKey(actorId: string, name: string) {
    const raw = `nj_${randomBytes(24).toString('hex')}`;
    const entry = {
      id: randomBytes(8).toString('hex'),
      name,
      keyHash: createHash('sha256').update(raw).digest('hex'),
      keyPrefix: raw.slice(0, 10),
      createdAt: new Date(),
      revokedAt: null,
    };
    await this.settingsModel.updateOne(
      { key: 'default' },
      { $push: { apiKeys: entry } },
      { upsert: true },
    );
    await this.audit(actorId, 'API_KEY_GENERATE', 'platform_settings', entry.id, {
      name,
    });
    return { id: entry.id, name, apiKey: raw, keyPrefix: entry.keyPrefix };
  }

  async revokeApiKey(actorId: string, keyId: string) {
    await this.settingsModel.updateOne(
      { key: 'default', 'apiKeys.id': keyId },
      { $set: { 'apiKeys.$.revokedAt': new Date() } },
    );
    await this.audit(actorId, 'API_KEY_REVOKE', 'platform_settings', keyId, {});
    return { message: 'Revoked' };
  }

  async fraudSignals() {
    const [dupEmails, massApps, pendingNoDocs] = await Promise.all([
      this.userModel.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: { $toLower: '$email' },
            count: { $sum: 1 },
            ids: { $push: '$_id' },
          },
        },
        { $match: { count: { $gt: 1 } } },
        { $limit: 20 },
      ]),
      this.applicationModel.aggregate([
        {
          $group: {
            _id: '$applicantUserId',
            count: { $sum: 1 },
          },
        },
        { $match: { count: { $gte: 30 } } },
        { $limit: 20 },
      ]),
      this.companyModel
        .find({
          isDeleted: false,
          verificationStatus: CompanyVerificationStatus.PENDING,
          $or: [
            { verificationDocuments: { $size: 0 } },
            { verificationDocuments: { $exists: false } },
          ],
        })
        .select('name slug verificationStatus')
        .limit(20)
        .lean()
        .exec(),
    ]);
    return {
      duplicateEmails: dupEmails,
      massApplications: massApps,
      pendingCompaniesNoDocs: pendingNoDocs,
    };
  }

  async search(q: string) {
    if (!q || q.trim().length < 2) {
      throw new BadRequestException('Query must be at least 2 characters');
    }
    const re = new RegExp(q.trim(), 'i');
    const [users, companies, jobs, tickets] = await Promise.all([
      this.userModel
        .find({
          isDeleted: false,
          $or: [{ email: re }, { firstName: re }, { lastName: re }],
        })
        .select('email firstName lastName role')
        .limit(10)
        .lean()
        .exec(),
      this.companyModel
        .find({ isDeleted: false, name: re })
        .select('name slug verificationStatus')
        .limit(10)
        .lean()
        .exec(),
      this.jobModel
        .find({ isDeleted: false, title: re })
        .select('title status slug')
        .limit(10)
        .lean()
        .exec(),
      this.ticketModel
        .find({ subject: re })
        .select('subject status category')
        .limit(10)
        .lean()
        .exec(),
    ]);
    return { users, companies, jobs, tickets };
  }

  async deactivateEmployerMembership(actorId: string, employerId: string) {
    const emp = await this.employerModel
      .findOneAndUpdate(
        { _id: employerId, isDeleted: false },
        { isActive: false },
        { returnDocument: 'after' },
      )
      .exec();
    if (!emp) throw new NotFoundException('Employer membership not found');
    await this.audit(
      actorId,
      'EMPLOYER_DEACTIVATE',
      'employer',
      employerId,
      {},
    );
    return emp;
  }

  private audit(
    actorId: string,
    action: string,
    targetType: string,
    targetId: string,
    meta: Record<string, unknown>,
  ) {
    return this.actionModel.create({
      actorId: new Types.ObjectId(actorId),
      action,
      targetType,
      targetId,
      meta,
    });
  }
}
