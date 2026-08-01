"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateCoverLetter } from "@/lib/ai-api";

export default function AiCoverLetterPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [letter, setLetter] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        AI Cover Letter
      </h1>
      <textarea
        className="min-h-32 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        placeholder="Job description…"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        disabled={busy || jobDescription.length < 10}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            const res = await generateCoverLetter({ jobDescription });
            setLetter(res.data.letter);
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
        {busy ? "Drafting…" : "Generate"}
      </Button>
      {letter && (
        <pre className="whitespace-pre-wrap rounded-xl border border-border bg-card p-4 text-sm">
          {letter}
        </pre>
      )}
    </div>
  );
}
