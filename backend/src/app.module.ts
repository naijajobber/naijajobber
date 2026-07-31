import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AiInfrastructureModule } from './infrastructure/ai/ai-infrastructure.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { QueuesModule } from './infrastructure/queues/queues.module';
import { UploadsModule } from './infrastructure/uploads/uploads.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { AdminModule } from './modules/admin/admin.module';
import { AiModule } from './modules/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { BillingModule } from './modules/billing/billing.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { EmployersModule } from './modules/employers/employers.module';
import { HealthModule } from './modules/health/health.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { LearningModule } from './modules/learning/learning.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { UsersModule } from './modules/users/users.module';
import { TalentPoolModule } from './modules/talent-pool/talent-pool.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { OffersModule } from './modules/offers/offers.module';
import { SupportModule } from './modules/support/support.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: (config.get<number>('throttle.ttl') || 60) * 1000,
          limit: config.get<number>('throttle.limit') || 100,
        },
      ],
    }),
    DatabaseModule,
    RedisModule,
    MailModule,
    LoggerModule,
    QueuesModule,
    UploadsModule,
    AiInfrastructureModule,
    HealthModule,
    UsersModule,
    AuthModule,
    EmployersModule,
    CompaniesModule,
    JobsModule,
    ApplicationsModule,
    NotificationsModule,
    MessagingModule,
    BillingModule,
    AiModule,
    AdminModule,
    ProfilesModule,
    InterviewsModule,
    LearningModule,
    ReferralsModule,
    TalentPoolModule,
    AssessmentsModule,
    OffersModule,
    SupportModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
