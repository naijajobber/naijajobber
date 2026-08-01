"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getMyApplications, withdrawApplication } from "@/lib/jobs-api";

const COLUMNS = [
  { key: "SUBMITTED", label: "Applied" },
  { key: "UNDER_REVIEW", label: "Under Review" },
  { key: "ASSESSMENT", label: "Assessment" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "OFFER", label: "Offer" },
  { key: "REJECTED", label: "Rejected" },
  { key: "WITHDRAWN", label: "Withdrawn" },
] as const;

export default function ApplicationTrackerPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const q = useQuery({ queryKey: ["my-applications"], queryFn: getMyApplications });
  const apps = q.data?.data || [];

  const grouped = useMemo(() => {
    const map: Record<string, typeof apps> = {};
    for (const col of COLUMNS) map[col.key] = [];
    for (const app of apps) {
      if (filter && !app.status.toLowerCase().includes(filter.toLowerCase())) {
        continue;
      }
      const key = COLUMNS.some((c) => c.key === app.status)
        ? app.status
        : "SUBMITTED";
      map[key].push(app);
    }
    return map;
  }, [apps, filter]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Application Tracker
      </h1>
      <p className="mt-1 text-sm text-muted">
        Kanban view of your applications. Withdraw from Applied / Under Review.
      </p>
      <input
        className="mt-4 h-10 w-full max-w-xs rounded-md border border-border bg-background px-3 text-sm"
        placeholder="Filter by status…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className="mt-6 flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className="w-56 shrink-0 rounded-xl border border-border bg-card p-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {col.label} ({grouped[col.key]?.length || 0})
            </p>
            <ul className="mt-3 space-y-2">
              {(grouped[col.key] || []).map((app) => (
                <li
                  key={app._id}
                  className="rounded-lg border border-border bg-surface p-2 text-xs"
                >
                  <p className="font-medium line-clamp-2">
                    {app.job?.title || app.coverLetter || app.jobId}
                  </p>
                  <p className="mt-1 text-muted">
                    {app.createdAt
                      ? new Date(app.createdAt).toLocaleDateString()
                      : ""}
                  </p>
                  {(app.status === "SUBMITTED" ||
                    app.status === "UNDER_REVIEW") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2 h-7 px-2"
                      onClick={async () => {
                        await withdrawApplication(app._id);
                        await qc.invalidateQueries({
                          queryKey: ["my-applications"],
                        });
                      }}
                    >
                      Withdraw
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {!apps.length && (
        <p className="mt-4 text-sm text-muted">No tracked applications.</p>
      )}
    </div>
  );
}
