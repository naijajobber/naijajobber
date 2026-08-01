"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  approvePublishAdminJob,
  archiveAdminJob,
  closeAdminJob,
  deleteAdminJob,
  duplicateAdminJob,
  featureAdminJob,
  flagAdminJob,
  listAdminJobs,
  listJobApplicants,
  pauseAdminJob,
  sponsorAdminJob,
  unpublishAdminJob,
  type AdminJob,
} from "@/lib/admin-api";

export default function AdminJobsPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const qc = useQueryClient();

  const jobsQ = useQuery({
    queryKey: ["admin-jobs", search, status],
    queryFn: () =>
      listAdminJobs({
        q: search || undefined,
        status: status || undefined,
        limit: 50,
      }),
  });
  const jobs = jobsQ.data?.data ?? [];

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin-jobs"] });
    void qc.invalidateQueries({ queryKey: ["admin-overview"] });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Job listings
      </h1>
      <p className="mt-1 text-sm text-muted">
        Moderate, feature, pause, close, archive, or duplicate jobs.
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
          placeholder="Search title"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="h-11 rounded-md border border-border bg-card px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      <div className="mt-6 space-y-2">
        {jobs.map((j) => (
          <JobRow key={j._id} job={j} onChanged={invalidate} />
        ))}
        {jobs.length === 0 && !jobsQ.isLoading && (
          <p className="text-sm text-muted">No jobs found.</p>
        )}
      </div>
    </div>
  );
}

function JobRow({ job, onChanged }: { job: AdminJob; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [apps, setApps] = useState<unknown[] | null>(null);
  const [busy, setBusy] = useState(false);

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
          <p className="font-medium">{job.title}</p>
          <p className="text-xs text-muted">
            {job.status}
            {job.slug ? ` · ${job.slug}` : ""}
            {job.category ? ` · ${job.category}` : ""}
            {job.flagged ? " · flagged" : ""}
            {job.paused ? " · paused" : ""}
            {job.isFeatured ? " · featured" : ""}
            {job.isSponsored ? " · sponsored" : ""}
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide" : "Actions"}
        </Button>
      </div>
      {open && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          <Button
            size="sm"
            disabled={busy}
            onClick={() => run(() => approvePublishAdminJob(job._id))}
          >
            Approve publish
          </Button>
          {job.status === "PUBLISHED" && (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => run(() => unpublishAdminJob(job._id))}
            >
              Unpublish
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => run(() => flagAdminJob(job._id, "Admin flag"))}
          >
            Flag
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => run(() => featureAdminJob(job._id, !job.isFeatured))}
          >
            {job.isFeatured ? "Unfeature" : "Feature"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() =>
              run(() => sponsorAdminJob(job._id, !job.isSponsored))
            }
          >
            {job.isSponsored ? "Unsponsor" : "Sponsor"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => run(() => pauseAdminJob(job._id, !job.paused))}
          >
            {job.paused ? "Resume" : "Pause"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => run(() => closeAdminJob(job._id))}
          >
            Close
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => run(() => archiveAdminJob(job._id))}
          >
            Archive
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => run(() => duplicateAdminJob(job._id))}
          >
            Duplicate
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={async () => {
              const res = await listJobApplicants(job._id, { limit: 20 });
              setApps(
                ((res as { data?: unknown[] }).data as unknown[]) || [],
              );
            }}
          >
            Applicants
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              if (confirm("Soft-delete this job?")) {
                void run(() => deleteAdminJob(job._id));
              }
            }}
          >
            Delete
          </Button>
        </div>
      )}
      {apps && (
        <p className="mt-2 text-xs text-muted">
          {apps.length} applicant(s) loaded for this job.
        </p>
      )}
    </div>
  );
}
