"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyInsights } from "@/lib/profiles-api";

export default function InsightsPage() {
  const q = useQuery({ queryKey: ["seeker-insights"], queryFn: getMyInsights });
  const data = (q.data?.data || {}) as {
    profileViews?: number;
    resumeDownloads?: number;
    totalApplications?: number;
    byStatus?: Record<string, number>;
    interviewRate?: number;
    offerRate?: number;
    monthlyTrend?: Array<{ month: string; count: number }>;
    skillsCount?: number;
  };

  if (q.isLoading) {
    return <p className="text-sm text-muted">Loading insights…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Career Insights
      </h1>
      <p className="mt-1 text-sm text-muted">
        Analytics from your applications and profile activity.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card label="Profile views" value={data.profileViews ?? 0} />
        <Card label="Resume downloads" value={data.resumeDownloads ?? 0} />
        <Card label="Applications" value={data.totalApplications ?? 0} />
        <Card
          label="Interview rate"
          value={`${Math.round((data.interviewRate || 0) * 100)}%`}
        />
        <Card
          label="Offer rate"
          value={`${Math.round((data.offerRate || 0) * 100)}%`}
        />
        <Card label="Skills listed" value={data.skillsCount ?? 0} />
      </div>

      {data.byStatus && Object.keys(data.byStatus).length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">By status</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(data.byStatus).map(([k, v]) => (
              <span
                key={k}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-xs"
              >
                {k.replace(/_/g, " ")}: {v}
              </span>
            ))}
          </div>
        </section>
      )}

      {!!data.monthlyTrend?.length && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Monthly applications</h2>
          <ul className="mt-3 space-y-2">
            {data.monthlyTrend.map((m) => (
              <li
                key={m.month}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span>{m.month}</span>
                <span className="font-medium">{m.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
