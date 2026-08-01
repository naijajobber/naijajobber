"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listAdminUsers, type AdminUser } from "@/lib/admin-api";

/** Support agents: view-only user directory (no role/delete/reset). */
export default function OpsUsersPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");

  const usersQ = useQuery({
    queryKey: ["ops-users", search],
    queryFn: () => listAdminUsers({ q: search || undefined, limit: 50 }),
  });
  const users = usersQ.data?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Users
      </h1>
      <p className="mt-1 text-sm text-muted">
        Read-only directory for support. Escalate role changes to an admin.
      </p>

      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(q.trim());
        }}
      >
        <Input
          placeholder="Search email or name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="mt-6 space-y-2">
        {users.map((u) => (
          <UserCard key={u._id} user={u} />
        ))}
        {users.length === 0 && !usersQ.isLoading && (
          <p className="text-sm text-muted">No users found.</p>
        )}
      </div>
    </div>
  );
}

function UserCard({ user }: { user: AdminUser }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
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
      </p>
    </div>
  );
}
