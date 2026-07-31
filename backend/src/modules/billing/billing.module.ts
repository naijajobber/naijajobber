import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsInfrastructureModule } from '../../infrastructure/payments/payments-infrastructure.module';
import { EmployersModule } from '../employers/employers.module';
import { JobsModule } from '../jobs/jobs.module';
import { UsersModule } from '../users/users.module';
import { BillingController } from './controllers/billing.controller';
import { Coupon, CouponSchema } from './schemas/coupon.schema';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from './schemas/plan.schema';
import { RefundRequest, RefundRequestSchema } from './schemas/refund.schema';
import {
  Subscription,
  SubscriptionSchema,
} from './schemas/subscription.schema';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { Wallet, WalletSchema } from './schemas/wallet.schema';
import { BillingService } from './services/billing.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: RefundRequest.name, schema: RefundRequestSchema },
      { name: Wallet.name, schema: WalletSchema },
    ]),
    PaymentsInfrastructureModule,
    forwardRef(() => EmployersModule),
    UsersModule,
    forwardRef(() => JobsModule),
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
