"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { matchJobs, type JobMatchResult } from "@/lib/ai-api";

export default function AiMatchPage() {
  const [matches, setMatches] = useState<JobMatchResult["matches"]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        AI Job Match
      </h1>
      <p className="text-sm text-muted">Scores published jobs against your profile.</p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            const res = await matchJobs({ limit: 8 });
            setMatches(res.data.matches);
          } catch (err) {
            setError(
              (err as { response?: { data?: { message?: string } } })?.response?.data
                ?.message || "Failed",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Matching…" : "Find matches"}
      </Button>
      <div className="space-y-2">
        {matches.map((m) => (
          <div
            key={m.jobId}
            className="flex items-center justify-between rounded-xl border border-border px-3 py-3 text-sm"
          >
            <div>
              <p className="font-medium">{m.title}</p>
              <p className="text-xs text-muted">{m.reason}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-accent">{m.score}</span>
              {m.slug && (
                <Link href={`/jobs/${m.slug}`} className="text-accent hover:underline">
                  View
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
