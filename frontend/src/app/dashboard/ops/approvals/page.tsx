"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  listAdminCompanies,
  listAdminRefunds,
  rejectAdminCompany,
  requestAdminCompanyInfo,
  reviewAdminRefund,
  verifyAdminCompany,
} from "@/lib/admin-api";
import { useAuthStore } from "@/store/auth-store";

export default function OpsApprovalsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const showCompanies = role === "MODERATOR" || role === "FINANCE_MANAGER";
  const showRefunds = role === "FINANCE_MANAGER" || role === "MODERATOR";
  const qc = useQueryClient();

  const companiesQ = useQuery({
    queryKey: ["admin-companies", "PENDING", "ops"],
    queryFn: () => listAdminCompanies({ status: "PENDING", limit: 50 }),
    enabled: role === "MODERATOR",
  });
  const refundsQ = useQuery({
    queryKey: ["admin-refunds", "ops"],
    queryFn: () => listAdminRefunds({ limit: 50 }),
    enabled: role === "FINANCE_MANAGER",
  });

  const pendingCompanies = companiesQ.data?.data ?? [];
  const pendingRefunds = (refundsQ.data?.data ?? []).filter(
    (r) => r.status === "PENDING" || r.status === "REQUESTED",
  );

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin-companies"] });
    void qc.invalidateQueries({ queryKey: ["admin-refunds"] });
    void qc.invalidateQueries({ queryKey: ["ops-overview"] });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Approvals
        </h1>
        <p className="mt-1 text-sm text-muted">
          {role === "FINANCE_MANAGER"
            ? "Refunds awaiting review."
            : "Company verification and related queues."}
        </p>
      </div>

      {role === "MODERATOR" && (
        <section>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Companies</h2>
            <Link
              href="/dashboard/ops/verification"
              className="text-xs text-accent hover:underline"
            >
              Full verification
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {pendingCompanies.map((c) => (
              <div
                key={c._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted">
                    {c.slug} · docs: {c.verificationDocuments?.length ?? 0}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      await verifyAdminCompany(c._id);
                      invalidate();
                    }}
                  >
                    Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      await requestAdminCompanyInfo(
                        c._id,
                        "Please upload complete verification documents.",
                      );
                      invalidate();
                    }}
                  >
                    Request info
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await rejectAdminCompany(c._id, "Incomplete profile");
                      invalidate();
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            {pendingCompanies.length === 0 && (
              <p className="text-sm text-muted">No pending companies.</p>
            )}
          </div>
        </section>
      )}

      {role === "FINANCE_MANAGER" && (
        <section>
          <h2 className="text-lg font-semibold">Refunds</h2>
          <div className="mt-3 space-y-2">
            {pendingRefunds.map((r) => (
              <div
                key={r._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {r.currency || ""} {r.amount ?? "—"} · {r.status}
                  </p>
                  <p className="text-xs text-muted">{r.reason || r._id}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      await reviewAdminRefund(r._id, "APPROVED");
                      invalidate();
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      await reviewAdminRefund(r._id, "REJECTED");
                      invalidate();
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            {pendingRefunds.length === 0 && (
              <p className="text-sm text-muted">No refunds awaiting review.</p>
            )}
          </div>
        </section>
      )}

      {!showCompanies && !showRefunds && (
        <p className="text-sm text-muted">No approval queues for this role.</p>
      )}
    </div>
  );
}
