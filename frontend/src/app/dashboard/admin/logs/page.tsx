"use client";

import { useQuery } from "@tanstack/react-query";
import { listAdminAudit } from "@/lib/admin-api";

export default function AdminLogsPage() {
  const auditQ = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => listAdminAudit({ limit: 100 }),
  });
  const items = auditQ.data?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        System logs
      </h1>
      <p className="mt-1 text-sm text-muted">
        Audit-backed admin mutation log (mock ops stream).
      </p>

      <div className="mt-6 space-y-2">
        {items.map((a) => (
          <div
            key={a._id}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
          >
            <p className="font-medium">{a.action}</p>
            <p className="text-xs text-muted">
              {a.targetType}/{a.targetId}
              {a.createdAt
                ? ` · ${new Date(a.createdAt).toLocaleString()}`
                : ""}
            </p>
          </div>
        ))}
        {items.length === 0 && !auditQ.isLoading && (
          <p className="text-sm text-muted">No log entries.</p>
        )}
      </div>
    </div>
  );
}
