import api, { ApiEnvelope } from "./api";

export type Plan = {
  _id: string;
  code: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
};

export type Subscription = {
  _id: string;
  planCode: string;
  status: string;
  currentPeriodEnd?: string;
};

export type Invoice = {
  _id: string;
  number: string;
  total: number;
  currency: string;
  createdAt?: string;
};

export async function listPlans() {
  const { data } = await api.get<ApiEnvelope<Plan[]>>("/billing/plans");
  return data;
}

export async function createCheckout(payload: {
  purpose: "SUBSCRIPTION" | "FEATURED_JOB" | "SPONSORED_JOB";
  planCode?: string;
  jobId?: string;
  couponCode?: string;
  provider?: string;
}) {
  const { data } = await api.post<
    ApiEnvelope<{ checkoutUrl: string; reference: string; provider: string }>
  >("/billing/checkout", payload);
  return data;
}

export async function mySubscription() {
  const { data } = await api.get<ApiEnvelope<Subscription | null>>(
    "/billing/subscriptions/mine",
  );
  return data;
}

export async function listInvoices() {
  const { data } = await api.get<ApiEnvelope<Invoice[]>>("/billing/invoices");
  return data;
}

export async function getWallet() {
  const { data } = await api.get<
    ApiEnvelope<{ balance: number; currency: string; pendingBalance?: number }>
  >("/billing/wallet");
  return data;
}

export async function listWalletTransactions() {
  const { data } = await api.get("/billing/wallet/transactions");
  return data;
}

export async function withdrawWallet(amount: number) {
  const { data } = await api.post("/billing/wallet/withdraw", { amount });
  return data;
}

export async function cancelSubscription() {
  const { data } = await api.post<ApiEnvelope<Subscription>>(
    "/billing/subscriptions/cancel",
  );
  return data;
}
