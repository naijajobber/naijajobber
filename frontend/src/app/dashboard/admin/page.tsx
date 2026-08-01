"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getAdminOverview } from "@/lib/admin-api";

export default function AdminHomePage() {
  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getAdminOverview,
  });
  const ov = overview.data?.data;

  const monthlyRev =
    ov?.monthlyRevenue?.find((r) => r._id === "USD")?.total ??
    ov?.monthlyRevenue?.[0]?.total ??
    0;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
        Analytics
      </h1>
      <p className="mt-1 text-sm text-muted">
        Live platform KPIs from Mongo aggregates — no placeholder series.
      </p>

      {overview.isLoading && (
        <p className="mt-8 text-sm text-muted">Loading overview…</p>
      )}
      {overview.isError && (
        <p className="mt-8 text-sm text-red-600">Failed to load overview.</p>
      )}

      {ov && (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Users" value={ov.users} href="/dashboard/admin/users" />
            <Stat
              label="Employers"
              value={ov.employers ?? 0}
              href="/dashboard/admin/employers"
            />
            <Stat
              label="Pending companies"
              value={ov.companies.pending}
              href="/dashboard/admin/approvals"
            />
            <Stat
              label="Open tickets"
              value={ov.openSupportTickets ?? 0}
              href="/dashboard/admin/support"
            />
            <Stat
              label="Published jobs"
              value={ov.jobs.published}
              href="/dashboard/admin/jobs"
            />
            <Stat label="Apps (7 days)" value={ov.applicationsLast7Days} />
            <Stat label="Interviews scheduled" value={ov.interviewsScheduled ?? 0} />
            <Stat label="Hires" value={ov.hires ?? 0} />
            <Stat
              label="Active subscriptions"
              value={ov.activeSubscriptions ?? 0}
              href="/dashboard/admin/subscriptions"
            />
            <Stat
              label="Monthly revenue"
              value={monthlyRev}
              href="/dashboard/admin/revenue"
              prefix={ov.monthlyRevenue?.[0]?._id ? `${ov.monthlyRevenue[0]._id} ` : ""}
            />
            <Stat label="AI runs today" value={ov.aiRunsToday ?? 0} href="/dashboard/admin/ai" />
            <Stat label="DAU / MAU" value={ov.dau ?? 0} suffix={` / ${ov.mau ?? 0}`} />
          </div>

          {ov.monthlyTrends && ov.monthlyTrends.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold">Monthly trends</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead className="text-xs text-muted">
                    <tr>
                      <th className="py-2 pr-4">Month</th>
                      <th className="py-2 pr-4">Users</th>
                      <th className="py-2 pr-4">Jobs</th>
                      <th className="py-2">Applications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ov.monthlyTrends.map((t) => (
                      <tr key={t.month} className="border-t border-border">
                        <td className="py-2 pr-4">{t.month}</td>
                        <td className="py-2 pr-4">{t.users}</td>
                        <td className="py-2 pr-4">{t.jobs}</td>
                        <td className="py-2">{t.applications}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {ov.recentActivities && ov.recentActivities.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold">Recent admin activity</h2>
              <ul className="mt-3 space-y-2">
                {ov.recentActivities.slice(0, 8).map((a) => (
                  <li
                    key={a._id}
                    className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{a.action}</span>
                    <span className="text-muted">
                      {" "}
                      · {a.targetType}/{a.targetId}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/dashboard/admin/approvals">
          <Button>Pending approvals</Button>
        </Link>
        <Link href="/dashboard/admin/verification">
          <Button variant="secondary">Employer verification</Button>
        </Link>
        <Link href="/dashboard/admin/audit">
          <Button variant="secondary">Audit logs</Button>
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: number;
  href?: string;
  prefix?: string;
  suffix?: string;
}) {
  const inner = (
    <>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">
        {prefix}
        {value}
        {suffix}
      </p>
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/40"
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4">{inner}</div>
  );
}
