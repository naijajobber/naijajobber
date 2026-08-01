"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  getAdminFraudSignals,
  suspendAdminUser,
} from "@/lib/admin-api";

export default function AdminFraudPage() {
  const qc = useQueryClient();
  const fraudQ = useQuery({
    queryKey: ["admin-fraud"],
    queryFn: getAdminFraudSignals,
  });
  const payload =
    (fraudQ.data as { data?: {
      duplicateEmails?: Array<{ _id: string; count: number; ids: string[] }>;
      massApplications?: Array<{ _id: string; count: number }>;
      pendingCompaniesNoDocs?: Array<{ _id: string; name: string }>;
    } })?.data ||
    (fraudQ.data as {
      duplicateEmails?: Array<{ _id: string; count: number; ids: string[] }>;
      massApplications?: Array<{ _id: string; count: number }>;
      pendingCompaniesNoDocs?: Array<{ _id: string; name: string }>;
    });

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Fraud signals
        </h1>
        <p className="mt-1 text-sm text-muted">
          Heuristic MVP list — suspend users when needed.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Duplicate emails</h2>
        <div className="mt-3 space-y-2">
          {(payload?.duplicateEmails ?? []).map((d) => (
            <div
              key={String(d._id)}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              {String(d._id)} · count {d.count}
            </div>
          ))}
          {(payload?.duplicateEmails ?? []).length === 0 && (
            <p className="text-sm text-muted">None detected.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Mass applications</h2>
        <div className="mt-3 space-y-2">
          {(payload?.massApplications ?? []).map((m) => (
            <div
              key={String(m._id)}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <span>
                user {String(m._id)} · {m.count} apps
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await suspendAdminUser(String(m._id));
                  void qc.invalidateQueries({ queryKey: ["admin-fraud"] });
                }}
              >
                Suspend
              </Button>
            </div>
          ))}
          {(payload?.massApplications ?? []).length === 0 && (
            <p className="text-sm text-muted">None detected.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Pending companies without docs</h2>
        <div className="mt-3 space-y-2">
          {(payload?.pendingCompaniesNoDocs ?? []).map((c) => (
            <div
              key={c._id}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              {c.name}
            </div>
          ))}
          {(payload?.pendingCompaniesNoDocs ?? []).length === 0 && (
            <p className="text-sm text-muted">None detected.</p>
          )}
        </div>
      </section>
    </div>
  );
}
