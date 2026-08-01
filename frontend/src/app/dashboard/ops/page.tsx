"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  getAdminOverview,
  getAdminReferrals,
  listAdminRefunds,
  listAdminTickets,
} from "@/lib/admin-api";
import { useAuthStore } from "@/store/auth-store";

export default function OpsHomePage() {
  const role = useAuthStore((s) => s.user?.role);

  const overview = useQuery({
    queryKey: ["ops-overview"],
    queryFn: getAdminOverview,
  });
  const tickets = useQuery({
    queryKey: ["ops-tickets-home"],
    queryFn: () => listAdminTickets({ status: "OPEN", limit: 5 }),
    enabled: role === "SUPPORT_AGENT",
  });
  const refunds = useQuery({
    queryKey: ["ops-refunds-home"],
    queryFn: () => listAdminRefunds({ limit: 20 }),
    enabled: role === "FINANCE_MANAGER",
  });
  const referrals = useQuery({
    queryKey: ["ops-referrals-home"],
    queryFn: getAdminReferrals,
    enabled: role === "MARKETING_MANAGER",
  });

  const ov = overview.data?.data;
  const pendingRefunds = (refunds.data?.data ?? []).filter(
    (r) => r.status === "PENDING" || r.status === "REQUESTED",
  ).length;
  const refTotals =
    (referrals.data as { data?: { totals?: { registrations?: number; clicks?: number } } })
      ?.data?.totals ||
    (referrals.data as { totals?: { registrations?: number; clicks?: number } })
      ?.totals;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
        Ops dashboard
      </h1>
      <p className="mt-1 text-sm text-muted">
        Role-scoped workspace for {role?.replace(/_/g, " ").toLowerCase()}.
      </p>

      {overview.isLoading && (
        <p className="mt-8 text-sm text-muted">Loading…</p>
      )}

      {role === "MODERATOR" && ov && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Stat
            label="Pending companies"
            value={ov.companies.pending}
            href="/dashboard/ops/approvals"
          />
          <Stat
            label="Request info"
            value={ov.companies.requestInfo ?? 0}
            href="/dashboard/ops/verification"
          />
          <Stat
            label="Draft jobs"
            value={ov.jobs.draft}
            href="/dashboard/ops/jobs"
          />
          <Stat
            label="Published jobs"
            value={ov.jobs.published}
            href="/dashboard/ops/jobs"
          />
          <Stat label="Apps (7 days)" value={ov.applicationsLast7Days} />
        </div>
      )}

      {role === "SUPPORT_AGENT" && (
        <div className="mt-8 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat
              label="Open tickets"
              value={ov?.openSupportTickets ?? tickets.data?.data?.length ?? 0}
              href="/dashboard/ops/support"
            />
            <Stat label="Users" value={ov?.users ?? 0} href="/dashboard/ops/users" />
          </div>
          <Link href="/dashboard/ops/support">
            <Button>Open support queue</Button>
          </Link>
        </div>
      )}

      {role === "FINANCE_MANAGER" && ov && (
        <div className="mt-8 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              label="Monthly revenue"
              value={
                ov.monthlyRevenue?.find((r) => r._id === "USD")?.total ??
                ov.monthlyRevenue?.[0]?.total ??
                0
              }
              href="/dashboard/ops/revenue"
            />
            <Stat
              label="Active subscriptions"
              value={ov.activeSubscriptions ?? 0}
              href="/dashboard/ops/subscriptions"
            />
            <Stat
              label="Pending refunds"
              value={pendingRefunds}
              href="/dashboard/ops/approvals"
            />
          </div>
        </div>
      )}

      {role === "MARKETING_MANAGER" && (
        <div className="mt-8 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              label="Referral clicks"
              value={refTotals?.clicks ?? 0}
              href="/dashboard/ops/referrals"
            />
            <Stat
              label="Referral regs"
              value={refTotals?.registrations ?? 0}
              href="/dashboard/ops/referrals"
            />
            <Stat
              label="Apps (7 days)"
              value={ov?.applicationsLast7Days ?? 0}
              href="/dashboard/ops/growth"
            />
          </div>
          <Link href="/dashboard/ops/newsletter">
            <Button>Compose broadcast</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
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
