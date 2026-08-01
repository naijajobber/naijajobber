"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminImpact } from "@/lib/admin-api";

export default function AdminGrantsPage() {
  const impactQ = useQuery({
    queryKey: ["admin-impact"],
    queryFn: getAdminImpact,
  });
  const impact =
    (impactQ.data as { data?: Record<string, number> })?.data ||
    (impactQ.data as Record<string, number>) ||
    {};

  const cards = [
    { label: "Seekers", key: "seekers" },
    { label: "Remote jobs", key: "remoteJobs" },
    { label: "Hires", key: "hires" },
    { label: "Verified employers", key: "verifiedEmployers" },
    { label: "Countries", key: "countries" },
    { label: "Women (provisional)", key: "women" },
    { label: "Youth (provisional)", key: "youth" },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Grant / impact metrics
      </h1>
      <p className="mt-1 text-sm text-muted">
        Aggregates for impact reporting. Women/youth use optional demographics.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.key}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-xs text-muted">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold">
              {Number(impact[c.key] ?? 0)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
