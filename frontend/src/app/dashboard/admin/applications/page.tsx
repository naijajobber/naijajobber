"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { listAdminApplications } from "@/lib/admin-api";

export default function AdminApplicationsPage() {
  const [status, setStatus] = useState("");
  const appsQ = useQuery({
    queryKey: ["admin-applications", status],
    queryFn: () =>
      listAdminApplications({ status: status || undefined, limit: 50 }),
  });
  const apps = appsQ.data?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Applications
      </h1>
      <p className="mt-1 text-sm text-muted">
        Platform-wide application queue with status filters.
      </p>

      <div className="mt-6 flex gap-2">
        <select
          className="h-11 rounded-md border border-border bg-card px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {[
            "SUBMITTED",
            "UNDER_REVIEW",
            "INTERVIEW",
            "OFFER",
            "HIRED",
            "REJECTED",
            "WITHDRAWN",
          ].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          onClick={() => void appsQ.refetch()}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-6 space-y-2">
        {apps.map((a) => (
          <div
            key={a._id}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
          >
            <p className="font-medium">{a.status}</p>
            <p className="text-xs text-muted">
              job: {a.jobId} · applicant: {a.applicantUserId}
              {a.createdAt
                ? ` · ${new Date(a.createdAt).toLocaleString()}`
                : ""}
            </p>
          </div>
        ))}
        {apps.length === 0 && !appsQ.isLoading && (
          <p className="text-sm text-muted">No applications found.</p>
        )}
      </div>
    </div>
  );
}
