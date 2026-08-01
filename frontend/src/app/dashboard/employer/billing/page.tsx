"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  cancelSubscription,
  createCheckout,
  listPlans,
  mySubscription,
} from "@/lib/billing-api";

export default function EmployerBillingPage() {
  const plansQuery = useQuery({ queryKey: ["plans"], queryFn: listPlans });
  const subQuery = useQuery({ queryKey: ["my-sub"], queryFn: mySubscription });

  const plans = plansQuery.data?.data ?? [];
  const sub = subQuery.data?.data;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            Subscription plans
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage employer plans. Mock checkout completes immediately locally.
          </p>
        </div>
        <Link href="/dashboard/employer/billing/invoices">
          <Button size="sm" variant="secondary">
            Invoices
          </Button>
        </Link>
      </div>

      <section className="mt-8 rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Current plan</h2>
        {sub ? (
          <div className="mt-2 text-sm">
            <p>
              {sub.planCode} · {sub.status}
            </p>
            <Button
              className="mt-3"
              variant="secondary"
              size="sm"
              onClick={async () => {
                await cancelSubscription();
                void subQuery.refetch();
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">No active paid subscription.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Plans</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {plans
            .filter((p) => !p.code.includes("FEATURED") || p.code === "EMPLOYER_PRO")
            .map((plan) => (
              <div
                key={plan._id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <p className="font-semibold">{plan.name}</p>
                <p className="mt-1 text-2xl font-bold">
                  {plan.price === 0
                    ? "Free"
                    : `${plan.currency} ${plan.price}/${plan.interval}`}
                </p>
                {plan.price > 0 && (
                  <Button
                    className="mt-4"
                    onClick={async () => {
                      const res = await createCheckout({
                        purpose: "SUBSCRIPTION",
                        planCode: plan.code,
                        provider: "mock",
                      });
                      const url = res.data?.checkoutUrl;
                      if (url) window.location.href = url;
                      void subQuery.refetch();
                    }}
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
