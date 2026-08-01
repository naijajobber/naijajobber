"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getMyApplications, withdrawApplication } from "@/lib/jobs-api";

export default function AppliedJobsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["my-applications"], queryFn: getMyApplications });
  const apps = q.data?.data || [];

  if (q.isLoading) {
    return <p className="text-sm text-muted">Loading applications…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Applied Jobs
      </h1>
      <p className="mt-1 text-sm text-muted">
        Timeline of each application — company, status, and notes.
      </p>
      <div className="mt-6 space-y-4">
        {apps.map((app) => (
          <article
            key={app._id}
            className="rounded-xl border border-border bg-card p-4 text-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {app.job?.title || `Job ${app.jobId}`}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {app.job?.location || "—"} ·{" "}
                  <span className="uppercase tracking-wide">
                    {app.status.replace(/_/g, " ")}
                  </span>
                </p>
                {app.createdAt && (
                  <p className="mt-1 text-xs text-muted">
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {app.job?.slug && (
                  <Link
                    href={`/jobs/${app.job.slug}`}
                    className="text-xs text-accent hover:underline"
                  >
                    View job
                  </Link>
                )}
                {app.status !== "WITHDRAWN" && (
                  <Button
                    size="sm"
                    variant="secondary"
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
              </div>
            </div>
            {!!app.timeline?.length && (
              <ol className="mt-4 space-y-2 border-t border-border pt-3">
                {[...app.timeline]
                  .slice()
                  .reverse()
                  .map((t, i) => (
                    <li key={`${t.at}-${i}`} className="text-xs">
                      <span className="font-medium">
                        {t.status.replace(/_/g, " ")}
                      </span>
                      {t.note ? ` — ${t.note}` : ""}
                      {t.at && (
                        <span className="text-muted">
                          {" "}
                          · {new Date(t.at).toLocaleString()}
                        </span>
                      )}
                    </li>
                  ))}
              </ol>
            )}
            {app.coverLetter && (
              <p className="mt-3 line-clamp-2 text-xs text-muted">
                Note: {app.coverLetter}
              </p>
            )}
          </article>
        ))}
        {!apps.length && (
          <p className="text-sm text-muted">
            No applications yet.{" "}
            <Link href="/jobs" className="text-accent hover:underline">
              Browse jobs
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
