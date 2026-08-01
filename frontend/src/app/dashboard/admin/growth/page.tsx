"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getAdminOverview } from "@/lib/admin-api";

export default function AdminGrowthPage() {
  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getAdminOverview,
  });
  const ov = overview.data?.data;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Growth analytics
      </h1>
      <p className="mt-1 text-sm text-muted">
        Real monthly buckets from overview trends.
      </p>

      {ov && (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Card label="Total users" value={ov.users} />
            <Card label="DAU" value={ov.dau ?? 0} />
            <Card label="MAU" value={ov.mau ?? 0} />
            <Card label="Apps last 7 days" value={ov.applicationsLast7Days} />
            <Card label="Hires" value={ov.hires ?? 0} />
            <Card label="Active subscriptions" value={ov.activeSubscriptions ?? 0} />
          </div>

          {ov.monthlyTrends && ov.monthlyTrends.length > 0 && (
            <div className="mt-8 overflow-x-auto">
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
          )}
        </>
      )}

      <Link href="/dashboard/admin" className="mt-8 inline-block">
        <Button variant="secondary" size="sm">
          Back to dashboard
        </Button>
      </Link>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
