"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PLATFORM_ROLES } from "@/config/admin-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listAdminUsers, updateAdminUserRole } from "@/lib/admin-api";

export default function AdminRolesPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [userId, setUserId] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [role, setRole] = useState<string>("JOB_SEEKER");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Roles
      </h1>
      <p className="mt-1 text-sm text-muted">
        Platform roles are fixed. Assign a role to a user by search or ID.
      </p>

      <ul className="mt-6 flex flex-wrap gap-2">
        {PLATFORM_ROLES.map((r) => (
          <li
            key={r}
            className="rounded-md border border-border bg-card px-2 py-1 text-xs"
          >
            {r}
          </li>
        ))}
      </ul>

      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg(null);
          setErr(null);
          setBusy(true);
          try {
            let id = userId.trim();
            if (!id && q.trim()) {
              const res = await listAdminUsers({ q: q.trim(), limit: 5 });
              const first = res.data?.[0];
              if (!first) throw new Error("No user matched that search");
              id = first._id;
              setEmailHint(first.email);
              setUserId(id);
            }
            if (!id) throw new Error("Provide a user id or search email");
            await updateAdminUserRole(id, role);
            setMsg(`Updated ${emailHint || id} → ${role}`);
            void qc.invalidateQueries({ queryKey: ["admin-users"] });
          } catch (e2) {
            setErr(
              (e2 as Error)?.message ||
                (e2 as { response?: { data?: { message?: string } } })?.response
                  ?.data?.message ||
                "Failed to update role",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <Input
          placeholder="Search by email or name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Input
          placeholder="Or paste user id"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <select
          className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {PLATFORM_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {msg && <p className="text-sm text-accent">{msg}</p>}
        {err && <p className="text-sm text-red-500">{err}</p>}
        <Button type="submit" disabled={busy}>
          Assign role
        </Button>
      </form>
    </div>
  );
}
