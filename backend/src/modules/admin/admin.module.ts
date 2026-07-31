import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiRun, AiRunSchema } from '../ai/schemas/ai-run.schema';
import {
  Application,
  ApplicationSchema,
} from '../applications/schemas/application.schema';
import { BillingModule } from '../billing/billing.module';
import { Coupon, CouponSchema } from '../billing/schemas/coupon.schema';
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from '../billing/schemas/plan.schema';
import {
  RefundRequest,
  RefundRequestSchema,
} from '../billing/schemas/refund.schema';
import {
  Subscription,
  SubscriptionSchema,
} from '../billing/schemas/subscription.schema';
import {
  Transaction,
  TransactionSchema,
} from '../billing/schemas/transaction.schema';
import { CompaniesModule } from '../companies/companies.module';
import { Company, CompanySchema } from '../companies/schemas/company.schema';
import { Employer, EmployerSchema } from '../employers/schemas/employer.schema';
import {
  Interview,
  InterviewSchema,
} from '../interviews/schemas/interview.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import {
  LearningItem,
  LearningItemSchema,
} from '../learning/schemas/learning-item.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  SupportTicket,
  SupportTicketSchema,
} from '../support/schemas/support-ticket.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';
import { AdminController } from './controllers/admin.controller';
import { AdminAction, AdminActionSchema } from './schemas/admin-action.schema';
import {
  BlogPost,
  BlogPostSchema,
  CmsPage,
  CmsPageSchema,
} from './schemas/cms-page.schema';
import {
  PlatformSettings,
  PlatformSettingsSchema,
} from './schemas/platform-settings.schema';
import { AdminService } from './services/admin.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Job.name, schema: JobSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: RefundRequest.name, schema: RefundRequestSchema },
      { name: AdminAction.name, schema: AdminActionSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: Interview.name, schema: InterviewSchema },
      { name: SupportTicket.name, schema: SupportTicketSchema },
      { name: AiRun.name, schema: AiRunSchema },
      { name: Employer.name, schema: EmployerSchema },
      { name: PlatformSettings.name, schema: PlatformSettingsSchema },
      { name: CmsPage.name, schema: CmsPageSchema },
      { name: BlogPost.name, schema: BlogPostSchema },
      { name: LearningItem.name, schema: LearningItemSchema },
    ]),
    UsersModule,
    CompaniesModule,
    BillingModule,
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
