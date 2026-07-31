import { Injectable } from '@nestjs/common';
import {
  CheckoutInput,
  CheckoutResult,
  PaymentProvider,
  WebhookResult,
} from './payment-provider.interface';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock';

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    return {
      provider: this.name,
      checkoutUrl: `${input.successUrl}?reference=${input.reference}&provider=mock`,
      reference: input.reference,
      providerSessionId: `mock_${input.reference}`,
    };
  }

  async verifyWebhook(
    _headers: Record<string, string | string[] | undefined>,
    body: Buffer | string | Record<string, unknown>,
  ): Promise<WebhookResult> {
    const parsed =
      typeof body === 'string'
        ? (JSON.parse(body) as Record<string, unknown>)
        : Buffer.isBuffer(body)
          ? (JSON.parse(body.toString('utf8')) as Record<string, unknown>)
          : body;
    return {
      reference: String(parsed.reference || ''),
      status: 'success',
      provider: this.name,
      raw: parsed,
    };
  }

  async cancelSubscription(): Promise<void> {
    return;
  }
}
