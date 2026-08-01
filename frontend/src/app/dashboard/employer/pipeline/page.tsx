"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listCompanyApplications } from "@/lib/employer-api";
import { getMyJobs, updateApplicationStatus, type Application } from "@/lib/jobs-api";

const COLUMNS = [
  { key: "SUBMITTED", label: "Applied" },
  { key: "UNDER_REVIEW", label: "Screening" },
  { key: "ASSESSMENT", label: "Assessment" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "REFERENCE_CHECK", label: "Reference Check" },
  { key: "OFFER", label: "Offer" },
  { key: "HIRED", label: "Accepted" },
  { key: "REJECTED", label: "Rejected" },
] as const;

export default function PipelinePage() {
  const [jobFilter, setJobFilter] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const jobsQ = useQuery({ queryKey: ["my-jobs"], queryFn: getMyJobs });
  const appsQ = useQuery({
    queryKey: ["company-apps"],
    queryFn: listCompanyApplications,
  });

  const apps = useMemo(() => {
    const list = (appsQ.data?.data as Application[] | undefined) || [];
    return jobFilter ? list.filter((a) => a.jobId === jobFilter) : list;
  }, [appsQ.data, jobFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, Application[]> = {};
    for (const c of COLUMNS) map[c.key] = [];
    for (const app of apps) {
      const key = COLUMNS.some((c) => c.key === app.status)
        ? app.status
        : "SUBMITTED";
      map[key].push(app);
    }
    return map;
  }, [apps]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Hiring pipeline
      </h1>
      <p className="mt-1 text-sm text-muted">
        Kanban by stage. Moving a card notifies the candidate.
      </p>
      {toast && <p className="mt-2 text-sm text-accent">{toast}</p>}

      <select
        className="mt-4 h-10 rounded-md border border-border bg-background px-3 text-sm"
        value={jobFilter}
        onChange={(e) => setJobFilter(e.target.value)}
      >
        <option value="">All jobs</option>
        {(jobsQ.data?.data || []).map((j) => (
          <option key={j._id} value={j._id}>
            {j.title}
          </option>
        ))}
      </select>

      <div className="mt-6 flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className="w-52 shrink-0 rounded-xl border border-border bg-card p-3"
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
                    {[app.seeker?.firstName, app.seeker?.lastName]
                      .filter(Boolean)
                      .join(" ") ||
                      app.job?.title ||
                      app.coverLetter ||
                      app._id}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {COLUMNS.filter((c) => c.key !== col.key)
                      .slice(0, 4)
                      .map((next) => (
                        <button
                          key={next.key}
                          type="button"
                          className="rounded border border-border px-1.5 py-0.5 text-[10px] hover:border-accent"
                          onClick={async () => {
                            await updateApplicationStatus(app._id, {
                              status: next.key,
                            });
                            setToast(`Moved to ${next.label}`);
                            void appsQ.refetch();
                          }}
                        >
                          → {next.label}
                        </button>
                      ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
