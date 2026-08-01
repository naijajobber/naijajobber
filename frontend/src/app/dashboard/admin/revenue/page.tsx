"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getAdminOverview, getAdminRevenueAnalytics } from "@/lib/admin-api";

export default function AdminRevenuePage() {
  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getAdminOverview,
  });
  const analytics = useQuery({
    queryKey: ["admin-revenue-analytics"],
    queryFn: getAdminRevenueAnalytics,
  });

  const ov = overview.data?.data;
  const analyticsData = (analytics.data as { data?: {
    monthly?: Array<{ month: string; buckets: Array<{ _id: { currency?: string; purpose?: string }; total: number; count: number }> }>;
    byPlan?: Array<{ _id: string; count: number }>;
    byCurrency?: Array<{ _id: string; total: number }>;
  } })?.data || (analytics.data as {
    monthly?: Array<{ month: string; buckets: Array<{ _id: { currency?: string; purpose?: string }; total: number; count: number }> }>;
    byPlan?: Array<{ _id: string; count: number }>;
    byCurrency?: Array<{ _id: string; total: number }>;
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            Revenue
          </h1>
          <p className="mt-1 text-sm text-muted">
            Monthly buckets and plan/currency breakdowns from real aggregates.
          </p>
        </div>
        <Link href="/dashboard/admin/transactions">
          <Button size="sm" variant="secondary">
            All transactions
          </Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {(ov?.revenue ?? []).map((r) => (
          <div
            key={r._id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-xs text-muted">{r._id} total</p>
            <p className="mt-1 text-2xl font-semibold">{r.total}</p>
          </div>
        ))}
        {(ov?.monthlyRevenue ?? []).map((r) => (
          <div
            key={`m-${r._id}`}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-xs text-muted">{r._id} this month</p>
            <p className="mt-1 text-2xl font-semibold">{r.total}</p>
          </div>
        ))}
      </div>

      {analyticsData?.monthly && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Monthly</h2>
          <div className="mt-3 space-y-2">
            {analyticsData.monthly.map((m) => {
              const total = (m.buckets || []).reduce(
                (s, b) => s + (b.total || 0),
                0,
              );
              return (
                <div
                  key={m.month}
                  className="flex justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  <span>{m.month}</span>
                  <span className="font-medium">{total}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {analyticsData?.byPlan && analyticsData.byPlan.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Active by plan</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {analyticsData.byPlan.map((p) => (
              <span
                key={p._id}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-xs"
              >
                {p._id}: {p.count}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
