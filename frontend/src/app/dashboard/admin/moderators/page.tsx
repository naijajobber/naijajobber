"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  listAdminUsers,
  updateAdminUserRole,
  type AdminUser,
} from "@/lib/admin-api";

export default function AdminModeratorsPage() {
  const qc = useQueryClient();
  const usersQ = useQuery({
    queryKey: ["admin-users", "moderators"],
    queryFn: () => listAdminUsers({ limit: 100 }),
  });

  const moderators = (usersQ.data?.data ?? []).filter(
    (u) =>
      u.role === "MODERATOR" ||
      u.role === "SUPPORT_AGENT" ||
      u.role === "FINANCE_MANAGER" ||
      u.role === "MARKETING_MANAGER",
  );

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Moderators & ops staff
      </h1>
      <p className="mt-1 text-sm text-muted">
        MODERATOR, SUPPORT_AGENT, FINANCE_MANAGER, and MARKETING_MANAGER
        accounts.
      </p>

      <div className="mt-6 space-y-2">
        {moderators.map((u) => (
          <ModRow
            key={u._id}
            user={u}
            onChanged={() =>
              void qc.invalidateQueries({ queryKey: ["admin-users"] })
            }
          />
        ))}
        {moderators.length === 0 && !usersQ.isLoading && (
          <p className="text-sm text-muted">No moderators yet.</p>
        )}
      </div>
    </div>
  );
}

function ModRow({
  user,
  onChanged,
}: {
  user: AdminUser;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div>
        <p className="text-sm font-medium">{user.email}</p>
        <p className="text-xs text-muted">{user.role}</p>
      </div>
      <Button
        size="sm"
        variant="secondary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await updateAdminUserRole(user._id, "JOB_SEEKER");
            onChanged();
          } finally {
            setBusy(false);
          }
        }}
      >
        Demote to seeker
      </Button>
    </div>
  );
}
