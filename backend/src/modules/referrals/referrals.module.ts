import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { UsersModule } from '../users/users.module';
import { ReferralsController } from './controllers/referrals.controller';
import { ReferralsService } from './services/referrals.service';

@Module({
  imports: [UsersModule, BillingModule],
  controllers: [ReferralsController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}
