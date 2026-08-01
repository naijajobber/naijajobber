"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getAdminRbacMatrix } from "@/lib/admin-api";

export default function AdminPermissionsPage() {
  const matrixQ = useQuery({
    queryKey: ["admin-rbac-matrix"],
    queryFn: getAdminRbacMatrix,
  });
  const matrix =
    ((matrixQ.data as { data?: Record<string, string[]> })?.data as Record<
      string,
      string[]
    >) || {};

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            Permissions
          </h1>
          <p className="mt-1 text-sm text-muted">
            Static Role → actions matrix (v1). Assign roles on Users / Roles.
          </p>
        </div>
        <Link href="/dashboard/admin/roles">
          <Button size="sm" variant="secondary">
            Role assignment
          </Button>
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {Object.entries(matrix).map(([role, actions]) => (
          <div
            key={role}
            className="rounded-xl border border-border bg-card px-4 py-3"
          >
            <p className="text-sm font-semibold">{role}</p>
            <p className="mt-1 text-xs text-muted">
              {(actions || []).join(", ") || "none"}
            </p>
          </div>
        ))}
        {Object.keys(matrix).length === 0 && !matrixQ.isLoading && (
          <p className="text-sm text-muted">Matrix unavailable.</p>
        )}
      </div>
    </div>
  );
}
