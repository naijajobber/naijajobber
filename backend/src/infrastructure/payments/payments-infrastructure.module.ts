import { Module } from '@nestjs/common';
import { FlutterwaveProvider } from './flutterwave.provider';
import { MockPaymentProvider } from './mock.provider';
import { PaymentRouterService } from './payment-router.service';
import { PaystackProvider } from './paystack.provider';
import { StripeProvider } from './stripe.provider';

@Module({
  providers: [
    MockPaymentProvider,
    StripeProvider,
    PaystackProvider,
    FlutterwaveProvider,
    PaymentRouterService,
  ],
  exports: [PaymentRouterService],
})
export class PaymentsInfrastructureModule {}
