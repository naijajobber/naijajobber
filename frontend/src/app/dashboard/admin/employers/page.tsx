"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  deactivateAdminEmployer,
  listAdminEmployers,
} from "@/lib/admin-api";

export default function AdminEmployersPage() {
  const qc = useQueryClient();
  const employersQ = useQuery({
    queryKey: ["admin-employers"],
    queryFn: () => listAdminEmployers({ limit: 50 }),
  });
  const employers = employersQ.data?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Employers
      </h1>
      <p className="mt-1 text-sm text-muted">
        Memberships with jobs posted, verification, and plan.
      </p>

      <div className="mt-6 space-y-2">
        {employers.map((e) => (
          <div
            key={e._id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium">
                {e.companyName || e.title || "Untitled employer"}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {e.title} · jobs: {e.jobsPosted ?? 0} ·{" "}
                {e.verificationStatus || "no company"} · plan:{" "}
                {e.planCode || "none"}
                {e.isActive === false ? " · inactive" : ""}
              </p>
            </div>
            {e.isActive !== false && (
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await deactivateAdminEmployer(e._id);
                  void qc.invalidateQueries({ queryKey: ["admin-employers"] });
                }}
              >
                Deactivate
              </Button>
            )}
          </div>
        ))}
        {employers.length === 0 && !employersQ.isLoading && (
          <p className="text-sm text-muted">No employer records.</p>
        )}
      </div>
    </div>
  );
}
