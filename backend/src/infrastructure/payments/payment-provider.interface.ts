export type CheckoutPurpose = 'SUBSCRIPTION' | 'FEATURED_JOB' | 'SPONSORED_JOB';

export type CheckoutInput = {
  purpose: CheckoutPurpose;
  amount: number;
  currency: string;
  reference: string;
  customerEmail: string;
  metadata?: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
  planCode?: string;
};

export type CheckoutResult = {
  provider: string;
  checkoutUrl: string;
  reference: string;
  providerSessionId?: string;
};

export type WebhookResult = {
  reference: string;
  status: 'success' | 'failed' | 'pending';
  provider: string;
  raw?: unknown;
};

export interface PaymentProvider {
  readonly name: string;
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  verifyWebhook(
    headers: Record<string, string | string[] | undefined>,
    body: Buffer | string | Record<string, unknown>,
  ): Promise<WebhookResult>;
  cancelSubscription?(providerSubscriptionId: string): Promise<void>;
}
