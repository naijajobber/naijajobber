"use client";

import { useQuery } from "@tanstack/react-query";
import { listAdminAudit } from "@/lib/admin-api";

export default function AdminActivityPage() {
  const auditQ = useQuery({
    queryKey: ["admin-audit", "activity"],
    queryFn: () => listAdminAudit({ limit: 50 }),
  });
  const items = [...(auditQ.data?.data ?? [])].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Activity feed
      </h1>
      <p className="mt-1 text-sm text-muted">
        Recent admin actions in chronological order.
      </p>

      <ol className="mt-8 space-y-4 border-l border-border pl-4">
        {items.map((a) => (
          <li key={a._id} className="relative">
            <span className="absolute -left-[1.33rem] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
            <p className="text-sm font-medium">{a.action}</p>
            <p className="text-xs text-muted">
              {a.targetType} · {a.targetId}
            </p>
            {a.createdAt && (
              <p className="mt-0.5 text-[11px] text-muted">
                {new Date(a.createdAt).toLocaleString()}
              </p>
            )}
          </li>
        ))}
      </ol>
      {items.length === 0 && !auditQ.isLoading && (
        <p className="mt-6 text-sm text-muted">No recent activity.</p>
      )}
    </div>
  );
}
