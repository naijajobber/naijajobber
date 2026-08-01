"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { reviewResume, type ResumeReviewResult } from "@/lib/ai-api";

export default function AiResumePage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ResumeReviewResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        AI Resume Analysis
      </h1>
      <textarea
        className="min-h-40 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        placeholder="Paste resume text…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        disabled={busy || text.length < 20}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            const res = await reviewResume({ resumeText: text });
            setResult(res.data);
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
        {busy ? "Analyzing…" : "Analyze"}
      </Button>
      {result && (
        <div className="space-y-2 rounded-xl border border-border bg-card p-4 text-sm">
          <p>Score: {result.score ?? "—"}</p>
          <ul className="list-disc pl-5">
            {result.strengths?.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
