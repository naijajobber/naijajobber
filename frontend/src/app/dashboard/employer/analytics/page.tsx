"use client";

import { useQuery } from "@tanstack/react-query";
import { getEmployerAnalytics } from "@/lib/employer-api";

export default function AnalyticsPage() {
  const q = useQuery({
    queryKey: ["employer-analytics"],
    queryFn: getEmployerAnalytics,
  });
  const d = (q.data?.data || {}) as {
    funnel?: Record<string, number>;
    monthlyTrend?: Array<{ month: string; count: number }>;
    interviewRate?: number;
    hireRate?: number;
    topSkills?: Array<{ skill: string; count: number }>;
    topCountries?: Array<{ country: string; count: number }>;
    avgTimeToHireDays?: number;
    costPerHire?: number;
    totalApplications?: number;
    totalViews?: number;
  };

  if (q.isLoading) {
    return <p className="text-sm text-muted">Loading analytics…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Company analytics
        </h1>
        <p className="mt-1 text-sm text-muted">
          Funnel, conversion, and hiring performance from live data.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card label="Applications" value={d.totalApplications ?? 0} />
        <Card label="Job views" value={d.totalViews ?? 0} />
        <Card
          label="Interview rate"
          value={`${Math.round((d.interviewRate || 0) * 100)}%`}
        />
        <Card
          label="Hire rate"
          value={`${Math.round((d.hireRate || 0) * 100)}%`}
        />
        <Card
          label="Avg days to hire"
          value={d.avgTimeToHireDays ?? "—"}
        />
        <Card label="Cost per hire" value={d.costPerHire ?? "—"} />
      </div>

      {d.funnel && (
        <section>
          <h2 className="text-lg font-semibold">Recruitment funnel</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(d.funnel).map(([k, v]) => (
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

      {!!d.monthlyTrend?.length && (
        <section>
          <h2 className="text-lg font-semibold">Applications trend</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {d.monthlyTrend.map((m) => (
              <li
                key={m.month}
                className="flex justify-between rounded-lg border border-border px-3 py-2"
              >
                <span>{m.month}</span>
                <span>{m.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!!d.topSkills?.length && (
        <section>
          <h2 className="text-lg font-semibold">Top skills</h2>
          <p className="mt-2 text-sm text-muted">
            {d.topSkills.map((s) => `${s.skill} (${s.count})`).join(" · ")}
          </p>
        </section>
      )}

      {!!d.topCountries?.length && (
        <section>
          <h2 className="text-lg font-semibold">Top countries</h2>
          <p className="mt-2 text-sm text-muted">
            {d.topCountries
              .map((c) => `${c.country} (${c.count})`)
              .join(" · ")}
          </p>
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
