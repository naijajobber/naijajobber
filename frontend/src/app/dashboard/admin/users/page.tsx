"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PLATFORM_ROLES } from "@/config/admin-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteAdminUser,
  listAdminUsers,
  reactivateAdminUser,
  resetAdminUserPassword,
  suspendAdminUser,
  updateAdminUserRole,
  verifyAdminUserEmail,
  type AdminUser,
} from "@/lib/admin-api";

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [country, setCountry] = useState("");
  const qc = useQueryClient();

  const usersQ = useQuery({
    queryKey: ["admin-users", search, role, status, country],
    queryFn: () =>
      listAdminUsers({
        q: search || undefined,
        role: role || undefined,
        status: status || undefined,
        country: country || undefined,
        limit: 50,
      }),
  });

  const users = usersQ.data?.data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Users
      </h1>
      <p className="mt-1 text-sm text-muted">
        Filter, suspend, verify email, reset password, or change roles.
      </p>

      <form
        className="mt-6 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(q.trim());
        }}
      >
        <Input
          className="min-w-[12rem] flex-1"
          placeholder="Search email or name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="h-11 rounded-md border border-border bg-card px-3 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All roles</option>
          {PLATFORM_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-md border border-border bg-card px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <Input
          className="w-36"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      {usersQ.isLoading && (
        <p className="mt-6 text-sm text-muted">Loading users…</p>
      )}

      <div className="mt-6 space-y-2">
        {users.map((u) => (
          <UserRow
            key={u._id}
            user={u}
            onChanged={() =>
              void qc.invalidateQueries({ queryKey: ["admin-users"] })
            }
          />
        ))}
        {users.length === 0 && !usersQ.isLoading && (
          <p className="text-sm text-muted">No users found.</p>
        )}
      </div>
    </div>
  );
}

function UserRow({
  user,
  onChanged,
}: {
  user: AdminUser;
  onChanged: () => void;
}) {
  const [role, setRole] = useState(user.role);
  const [busy, setBusy] = useState(false);
  const [tempPass, setTempPass] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">
            {user.firstName} {user.lastName}
            {user.isActive === false && (
              <span className="ml-2 text-xs text-red-600">suspended</span>
            )}
          </p>
          <p className="text-xs text-muted">
            {user.email} · {user.role}
            {user.country ? ` · ${user.country}` : ""}
            {user.isEmailVerified ? " · verified" : " · email unverified"}
            {user.lastLoginAt
              ? ` · last login ${new Date(user.lastLoginAt).toLocaleDateString()}`
              : ""}
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide" : "Actions"}
        </Button>
      </div>

      {open && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <select
            className="h-9 rounded-md border border-border bg-background px-2 text-xs"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {PLATFORM_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy || role === user.role}
            onClick={() => run(() => updateAdminUserRole(user._id, role))}
          >
            Set role
          </Button>
          {user.isActive === false ? (
            <Button
              size="sm"
              disabled={busy}
              onClick={() => run(() => reactivateAdminUser(user._id))}
            >
              Reactivate
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => run(() => suspendAdminUser(user._id))}
            >
              Suspend
            </Button>
          )}
          {!user.isEmailVerified && (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => run(() => verifyAdminUserEmail(user._id))}
            >
              Verify email
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const res = await resetAdminUserPassword(user._id);
                const tp =
                  (res as { data?: { tempPassword?: string } })?.data
                    ?.tempPassword ||
                  (res as { tempPassword?: string })?.tempPassword;
                if (tp) setTempPass(tp);
                onChanged();
              } finally {
                setBusy(false);
              }
            }}
          >
            Reset password
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              if (confirm("Soft-delete this user?")) {
                void run(() => deleteAdminUser(user._id));
              }
            }}
          >
            Delete
          </Button>
        </div>
      )}
      {tempPass && (
        <p className="mt-2 text-xs text-amber-700">
          Temp password (mock): <code>{tempPass}</code>
        </p>
      )}
    </div>
  );
}
