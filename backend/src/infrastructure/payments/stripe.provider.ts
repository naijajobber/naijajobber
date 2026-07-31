import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CheckoutInput,
  CheckoutResult,
  PaymentProvider,
  WebhookResult,
} from './payment-provider.interface';

/**
 * Scaffold only — does NOT call the Stripe SDK.
 * Always returns a local success-style checkout URL.
 * Prefer PAYMENT_MODE=mock for local development.
 */
@Injectable()
export class StripeProvider implements PaymentProvider {
  readonly name = 'stripe';
  private readonly logger = new Logger(StripeProvider.name);

  constructor(config: ConfigService) {
    if (config.get<string>('payment.stripeSecretKey')) {
      this.logger.warn(
        'STRIPE_SECRET_KEY is set, but StripeProvider is still a scaffold (no SDK). Use PAYMENT_MODE=mock.',
      );
    }
  }

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    this.logger.warn('Stripe scaffold checkout — not a live Stripe session');
    return {
      provider: this.name,
      checkoutUrl: `${input.successUrl}?reference=${input.reference}&provider=stripe&scaffold=1`,
      reference: input.reference,
      providerSessionId: `stripe_scaffold_${input.reference}`,
    };
  }

  async verifyWebhook(
    _headers: Record<string, string | string[] | undefined>,
    body: Buffer | string | Record<string, unknown>,
  ): Promise<WebhookResult> {
    this.logger.warn('Stripe scaffold webhook — no signature verification');
    const parsed =
      typeof body === 'object' && !Buffer.isBuffer(body)
        ? body
        : JSON.parse(
            Buffer.isBuffer(body) ? body.toString('utf8') : String(body),
          );
    return {
      reference: String((parsed as { reference?: string }).reference || ''),
      status: 'success',
      provider: this.name,
      raw: parsed,
    };
  }
}
