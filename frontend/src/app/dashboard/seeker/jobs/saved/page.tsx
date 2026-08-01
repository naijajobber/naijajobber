"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyToJob } from "@/lib/jobs-api";
import { listSavedJobs, unsaveJob } from "@/lib/profiles-api";

type SavedItem = {
  savedAt?: string;
  job?: {
    _id: string;
    title?: string;
    slug?: string;
    status?: string;
    location?: string;
    workplaceType?: string;
  };
};

export default function SavedJobsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"recent" | "title">("recent");
  const savedQ = useQuery({ queryKey: ["saved-jobs"], queryFn: listSavedJobs });
  const items = (savedQ.data?.data as SavedItem[] | undefined) || [];

  const filtered = useMemo(() => {
    let list = items.filter((i) => i.job);
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter((i) =>
        (i.job?.title || "").toLowerCase().includes(needle),
      );
    }
    if (sort === "title") {
      list = [...list].sort((a, b) =>
        (a.job?.title || "").localeCompare(b.job?.title || ""),
      );
    }
    return list;
  }, [items, q, sort]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Saved Jobs
      </h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Input
          className="max-w-xs"
          placeholder="Search saved jobs"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="h-11 rounded-md border border-border bg-background px-3 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as "recent" | "title")}
        >
          <option value="recent">Sort: Recent</option>
          <option value="title">Sort: Title</option>
        </select>
      </div>
      <div className="mt-6 space-y-2">
        {filtered.map((item) =>
          item.job ? (
            <div
              key={item.job._id}
              className="rounded-xl border border-border px-3 py-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link
                    href={item.job.slug ? `/jobs/${item.job.slug}` : "/jobs"}
                    className="text-accent hover:underline"
                  >
                    {item.job.title || item.job._id}
                  </Link>
                  {item.job.status === "CLOSED" && (
                    <p className="text-xs text-red-400">This job has expired / closed</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {item.job.status !== "CLOSED" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        await applyToJob({ jobId: item.job!._id });
                        await qc.invalidateQueries({ queryKey: ["my-applications"] });
                      }}
                    >
                      Apply
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await unsaveJob(item.job!._id);
                      await qc.invalidateQueries({ queryKey: ["saved-jobs"] });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : null,
        )}
        {!filtered.length && (
          <p className="text-sm text-muted">No saved jobs yet.</p>
        )}
      </div>
    </div>
  );
}
