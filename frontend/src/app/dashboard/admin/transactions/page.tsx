"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  listAdminTransactions,
  retryMarkAdminTransaction,
} from "@/lib/admin-api";

export default function AdminTransactionsPage() {
  const qc = useQueryClient();
  const txsQ = useQuery({
    queryKey: ["admin-tx"],
    queryFn: () => listAdminTransactions({ limit: 100 }),
  });
  const txs = txsQ.data?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Transactions
      </h1>
      <p className="mt-1 text-sm text-muted">
        Billing transactions. Retry-mark sets mock status to SUCCESS.
      </p>

      <div className="mt-6 space-y-2">
        {txs.map((t) => (
          <div
            key={t._id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium">{t.reference}</p>
              <p className="text-xs text-muted">
                {t.purpose || "—"} · {t.status}
                {t.createdAt
                  ? ` · ${new Date(t.createdAt).toLocaleString()}`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span>
                {t.currency || ""} {t.amount}
              </span>
              {t.status !== "SUCCESS" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    await retryMarkAdminTransaction(t._id);
                    void qc.invalidateQueries({ queryKey: ["admin-tx"] });
                  }}
                >
                  Mark success
                </Button>
              )}
            </div>
          </div>
        ))}
        {txs.length === 0 && !txsQ.isLoading && (
          <p className="text-sm text-muted">No transactions yet.</p>
        )}
      </div>
    </div>
  );
}
