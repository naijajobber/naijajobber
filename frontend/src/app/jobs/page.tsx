"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchJobs, type Job } from "@/lib/jobs-api";

function jobId(job: Job) {
  return job._id || job.id || "";
}

function salaryLabel(job: Job) {
  if (job.salaryMin == null && job.salaryMax == null) return "Competitive";
  const cur = job.salaryCurrency || "USD";
  if (job.salaryMin != null && job.salaryMax != null) {
    return `${cur} ${job.salaryMin.toLocaleString()}–${job.salaryMax.toLocaleString()}`;
  }
  return `${cur} ${(job.salaryMin ?? job.salaryMax)!.toLocaleString()}`;
}

export default function JobsPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [workplaceType, setWorkplaceType] = useState("");
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      q: q || undefined,
      category: category || undefined,
      workplaceType: workplaceType || undefined,
      page,
      limit: 12,
      sort: "recent" as const,
    }),
    [q, category, workplaceType, page],
  );

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["jobs", params],
    queryFn: () => searchJobs(params),
  });

  const jobs = data?.data ?? [];
  const meta = data?.meta as
    | { page?: number; totalPages?: number; total?: number }
    | undefined;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Remote jobs
        </h1>
        <p className="mt-2 text-muted">
          Browse verified employer roles worldwide.
        </p>

        <form
          className="mt-8 grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-[1fr_auto_auto_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            void refetch();
          }}
        >
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <Input
              className="pl-9"
              placeholder="Search title, skills…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            className="h-11 rounded-md border border-border bg-card px-3 text-sm"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Product & Design">Product & Design</option>
            <option value="Data & AI">Data & AI</option>
            <option value="Marketing">Marketing</option>
            <option value="Customer Success">Customer Success</option>
          </select>
          <select
            className="h-11 rounded-md border border-border bg-card px-3 text-sm"
            value={workplaceType}
            onChange={(e) => {
              setWorkplaceType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Any workplace</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ONSITE">On-site</option>
          </select>
          <Button type="submit" disabled={isFetching}>
            Search
          </Button>
        </form>

        <div className="mt-8 space-y-3">
          {isLoading && <p className="text-sm text-muted">Loading jobs…</p>}
          {isError && (
            <p className="text-sm text-red-500">
              Could not load jobs. Is the API running?
            </p>
          )}
          {!isLoading && !isError && jobs.length === 0 && (
            <p className="text-sm text-muted">No jobs match your filters.</p>
          )}
          {jobs.map((job) => (
            <Link
              key={jobId(job)}
              href={`/jobs/${job.slug}`}
              className="block rounded-xl border border-border bg-card p-5 transition hover:border-accent/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{job.title}</h2>
                  <p className="mt-1 text-sm text-muted">{job.category}</p>
                </div>
                <span className="rounded-md bg-surface px-2 py-1 text-xs text-accent">
                  {job.employmentType.replaceAll("_", " ")}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} /> {job.location} · {job.workplaceType}
                </span>
                <span>{salaryLabel(job)}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills?.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border border-border px-2 py-1 text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {meta && (meta.totalPages || 1) > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted">
              Page {meta.page || page} of {meta.totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={page >= (meta.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
