"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminReferrals } from "@/lib/admin-api";

export default function AdminReferralsPage() {
  const refQ = useQuery({
    queryKey: ["admin-referrals"],
    queryFn: getAdminReferrals,
  });
  const payload =
    (refQ.data as { data?: {
      totals?: { clicks?: number; registrations?: number; earnings?: number };
      leaderboard?: Array<{
        _id: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        referralCode?: string;
        referralRegistrations?: number;
        referralEarnings?: number;
      }>;
      fraudFlags?: Array<{ userId: string; reason: string; registrations?: number }>;
    } })?.data ||
    (refQ.data as {
      totals?: { clicks?: number; registrations?: number; earnings?: number };
      leaderboard?: Array<{
        _id: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        referralCode?: string;
        referralRegistrations?: number;
        referralEarnings?: number;
      }>;
      fraudFlags?: Array<{ userId: string; reason: string; registrations?: number }>;
    });

  const totals = payload?.totals;
  const leaderboard = payload?.leaderboard ?? [];
  const fraudFlags = payload?.fraudFlags ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Referrals
      </h1>
      <p className="mt-1 text-sm text-muted">
        Leaderboard and mock fraud heuristics.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Card label="Clicks" value={totals?.clicks ?? 0} />
        <Card label="Registrations" value={totals?.registrations ?? 0} />
        <Card label="Earnings" value={totals?.earnings ?? 0} />
      </div>

      <h2 className="mt-10 text-lg font-semibold">Leaderboard</h2>
      <div className="mt-3 space-y-2">
        {leaderboard.map((u) => (
          <div
            key={u._id}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
          >
            <p className="font-medium">
              {u.firstName} {u.lastName} · {u.email}
            </p>
            <p className="text-xs text-muted">
              {u.referralCode} · regs {u.referralRegistrations ?? 0} · earn{" "}
              {u.referralEarnings ?? 0}
            </p>
          </div>
        ))}
        {leaderboard.length === 0 && !refQ.isLoading && (
          <p className="text-sm text-muted">No referral activity yet.</p>
        )}
      </div>

      {fraudFlags.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Fraud flags (mock)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {fraudFlags.map((f, i) => (
              <li
                key={i}
                className="rounded-lg border border-border bg-card px-3 py-2"
              >
                {f.reason} · {String(f.userId)}
              </li>
            ))}
          </ul>
        </section>
      )}
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
