"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { creditMockReferral, getMyReferrals } from "@/lib/seeker-extra-api";

export default function ReferralsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["referrals-me"], queryFn: getMyReferrals });
  const data = (q.data?.data || {}) as {
    code?: string;
    link?: string;
    clicks?: number;
    registrations?: number;
    earnings?: number;
    leaderboard?: Array<{ code: string; registrations: number }>;
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Referral Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted">
          Invite talent and track referral rewards (mock credits).
        </p>
      </div>

      {q.isLoading && <p className="text-sm text-muted">Loading…</p>}

      {data.code && (
        <div className="rounded-xl border border-border bg-card p-4 text-sm">
          <p className="text-xs text-muted">Your referral link</p>
          <p className="mt-1 break-all font-medium">{data.link || data.code}</p>
          <Button
            className="mt-3"
            size="sm"
            variant="secondary"
            onClick={() => {
              void navigator.clipboard.writeText(data.link || data.code || "");
            }}
          >
            Copy link
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Clicks" value={data.clicks ?? 0} />
        <Stat label="Registrations" value={data.registrations ?? 0} />
        <Stat label="Earnings" value={data.earnings ?? 0} />
      </div>

      <Button
        onClick={async () => {
          await creditMockReferral();
          await qc.invalidateQueries({ queryKey: ["referrals-me"] });
          await qc.invalidateQueries({ queryKey: ["wallet"] });
        }}
      >
        Claim mock referral credit
      </Button>

      {!!data.leaderboard?.length && (
        <section>
          <h2 className="text-lg font-semibold">Leaderboard</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.leaderboard.map((row) => (
              <li
                key={row.code}
                className="flex justify-between rounded-lg border border-border px-3 py-2"
              >
                <span>{row.code}</span>
                <span>{row.registrations} regs</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
