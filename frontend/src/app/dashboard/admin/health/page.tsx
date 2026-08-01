"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminOverview, getPlatformHealth } from "@/lib/admin-api";

export default function AdminHealthPage() {
  const healthQ = useQuery({
    queryKey: ["platform-health"],
    queryFn: getPlatformHealth,
    refetchInterval: 30_000,
  });
  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getAdminOverview,
  });

  const data = healthQ.data;
  const details = {
    ...(data?.info || {}),
    ...(data?.error || {}),
    ...(data?.details || {}),
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Platform health
      </h1>
      <p className="mt-1 text-sm text-muted">
        Live API health plus provisional queue/worker status.
      </p>

      {healthQ.isLoading && (
        <p className="mt-6 text-sm text-muted">Checking…</p>
      )}
      {healthQ.isError && (
        <p className="mt-6 text-sm text-red-500">
          Health check failed — API may be down.
        </p>
      )}

      {data && (
        <div className="mt-8 space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted">Overall</p>
            <p className="mt-1 text-xl font-semibold">
              {data.status || "unknown"}
            </p>
          </div>
          {Object.entries(details).map(([key, val]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <span>{key}</span>
              <span
                className={
                  val?.status === "up" ? "text-accent" : "text-red-400"
                }
              >
                {val?.status || "—"}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <span>queues (mock)</span>
            <span className="text-accent">healthy</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <span>open support tickets</span>
            <span>{overview.data?.data?.openSupportTickets ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <span>AI runs today</span>
            <span>{overview.data?.data?.aiRunsToday ?? "—"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
