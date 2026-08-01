"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  archiveJob,
  duplicateJob,
  pauseJob,
  unpauseJob,
} from "@/lib/employer-api";
import {
  closeJob,
  deleteJob,
  getMyCompany,
  getMyJobs,
  publishJob,
  type Job,
} from "@/lib/jobs-api";

type Filter = "all" | "draft" | "featured" | "sponsored";

export function JobsListPage({ filter = "all" }: { filter?: Filter }) {
  const qc = useQueryClient();
  const companyQ = useQuery({ queryKey: ["my-company"], queryFn: getMyCompany });
  const jobsQ = useQuery({
    queryKey: ["my-jobs"],
    queryFn: getMyJobs,
    enabled: !!companyQ.data?.data,
  });

  const jobs = (jobsQ.data?.data ?? []).filter((j) => {
    if (filter === "draft") return j.status === "DRAFT" && !j.archived;
    if (filter === "featured") return j.isFeatured;
    if (filter === "sponsored") return j.isUrgent;
    if (filter === "all") return !j.archived;
    return true;
  });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["my-jobs"] });

  const titles: Record<Filter, { title: string; blurb: string }> = {
    all: {
      title: "Active & all jobs",
      blurb: "Views, applications, and conversion for your listings.",
    },
    draft: {
      title: "Draft jobs",
      blurb: "Edit, preview, publish, or duplicate unpublished listings.",
    },
    featured: {
      title: "Featured jobs",
      blurb: "Promotion metrics and renew via billing checkout.",
    },
    sponsored: {
      title: "Sponsored jobs",
      blurb: "Budget, impressions, clicks, and ROI-style mock metrics.",
    },
  };
  const meta = titles[filter];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            {meta.title}
          </h1>
          <p className="mt-1 text-sm text-muted">{meta.blurb}</p>
        </div>
        <Link href="/dashboard/employer/jobs/new">
          <Button size="sm">Post job</Button>
        </Link>
      </div>

      {!companyQ.data?.data && (
        <p className="mt-6 text-sm text-muted">
          <Link href="/dashboard/employer/company" className="text-accent hover:underline">
            Create a company
          </Link>{" "}
          before posting jobs.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {jobs.map((job) => (
          <JobRow
            key={job._id}
            job={job}
            filter={filter}
            onDone={invalidate}
          />
        ))}
        {jobs.length === 0 && (
          <p className="text-sm text-muted">No jobs in this list yet.</p>
        )}
      </div>
    </div>
  );
}

function JobRow({
  job,
  filter,
  onDone,
}: {
  job: Job;
  filter: Filter;
  onDone: () => void;
}) {
  const apps = job.applicationCount ?? 0;
  const views = job.views ?? 0;
  const conversion =
    views > 0 ? `${Math.round((apps / views) * 100)}%` : "—";
  const impressions = job.impressions ?? views;
  const clicks = job.clicks ?? 0;
  const ctr =
    impressions > 0 ? `${Math.round((clicks / impressions) * 100)}%` : "—";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{job.title}</p>
          <p className="mt-0.5 text-xs text-muted">
            {job.status}
            {job.paused ? " · Paused" : ""}
            {job.isFeatured ? " · Featured" : ""}
            {job.isUrgent ? " · Sponsored" : ""}
          </p>
          <p className="mt-2 text-xs text-muted">
            Views {views} · Apps {apps} · Bookmarks {job.bookmarks ?? 0} ·
            Conversion {conversion}
            {(filter === "featured" || filter === "sponsored") && (
              <>
                {" "}
                · Impressions {impressions} · Clicks {clicks} · CTR {ctr}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/employer/jobs/${job._id}/edit`}>
            <Button size="sm" variant="secondary">
              Edit
            </Button>
          </Link>
          {job.status === "DRAFT" && (
            <Button size="sm" onClick={() => publishJob(job._id).then(onDone)}>
              Publish
            </Button>
          )}
          {job.status === "PUBLISHED" && !job.paused && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => pauseJob(job._id).then(onDone)}
            >
              Pause
            </Button>
          )}
          {job.paused && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => unpauseJob(job._id).then(onDone)}
            >
              Unpause
            </Button>
          )}
          {job.status === "PUBLISHED" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => closeJob(job._id).then(onDone)}
            >
              Close
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => duplicateJob(job._id).then(onDone)}
          >
            Duplicate
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => archiveJob(job._id).then(onDone)}
          >
            Archive
          </Button>
          {(filter === "featured" || filter === "sponsored") && (
            <Link
              href={`/dashboard/employer/billing?purpose=${
                filter === "sponsored" ? "SPONSORED_JOB" : "FEATURED_JOB"
              }&jobId=${job._id}`}
            >
              <Button size="sm" variant="ghost">
                Renew
              </Button>
            </Link>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm(`Delete “${job.title}”?`)) {
                void deleteJob(job._id).then(onDone);
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
