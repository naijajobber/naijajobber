import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CheckoutInput,
  CheckoutResult,
  PaymentProvider,
  WebhookResult,
} from './payment-provider.interface';

/**
 * Scaffold only — does NOT call the Flutterwave API.
 * Always returns a local success-style checkout URL.
 */
@Injectable()
export class FlutterwaveProvider implements PaymentProvider {
  readonly name = 'flutterwave';
  private readonly logger = new Logger(FlutterwaveProvider.name);

  constructor(config: ConfigService) {
    if (config.get<string>('payment.flutterwaveSecretKey')) {
      this.logger.warn(
        'FLUTTERWAVE_SECRET_KEY is set, but FlutterwaveProvider is still a scaffold (no API). Use PAYMENT_MODE=mock.',
      );
    }
  }

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    this.logger.warn(
      'Flutterwave scaffold checkout — not a live Flutterwave session',
    );
    return {
      provider: this.name,
      checkoutUrl: `${input.successUrl}?reference=${input.reference}&provider=flutterwave&scaffold=1`,
      reference: input.reference,
      providerSessionId: `flutterwave_scaffold_${input.reference}`,
    };
  }

  async verifyWebhook(
    _headers: Record<string, string | string[] | undefined>,
    body: Buffer | string | Record<string, unknown>,
  ): Promise<WebhookResult> {
    this.logger.warn(
      'Flutterwave scaffold webhook — no signature verification',
    );
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
