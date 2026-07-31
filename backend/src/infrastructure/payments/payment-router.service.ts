import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FlutterwaveProvider } from './flutterwave.provider';
import { MockPaymentProvider } from './mock.provider';
import { PaymentProvider } from './payment-provider.interface';
import { PaystackProvider } from './paystack.provider';
import { StripeProvider } from './stripe.provider';

@Injectable()
export class PaymentRouterService {
  constructor(
    private readonly config: ConfigService,
    private readonly mock: MockPaymentProvider,
    private readonly stripe: StripeProvider,
    private readonly paystack: PaystackProvider,
    private readonly flutterwave: FlutterwaveProvider,
  ) {}

  resolve(preferred?: string): PaymentProvider {
    const mode = this.config.get<string>('payment.mode') || 'mock';
    // Local / CI: always use MockPaymentProvider. Stripe/Paystack/Flutterwave
    // classes are scaffolds until real SDK wiring lands.
    if (mode === 'mock') return this.mock;

    const name = (
      preferred ||
      this.config.get<string>('payment.preferredProvider') ||
      'mock'
    ).toLowerCase();

    switch (name) {
      case 'stripe':
        return this.stripe;
      case 'paystack':
        return this.paystack;
      case 'flutterwave':
        return this.flutterwave;
      default:
        return this.mock;
    }
  }

  byName(name: string): PaymentProvider {
    return this.resolve(name);
  }
}
