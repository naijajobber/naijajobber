"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { generateCvDocument, getMyProfile } from "@/lib/profiles-api";

const TEMPLATES = [
  { id: "modern", label: "Modern" },
  { id: "professional", label: "Professional" },
  { id: "creative", label: "Creative" },
  { id: "minimal", label: "Minimal" },
] as const;

export default function ResumeBuilderPage() {
  const qc = useQueryClient();
  const profileQ = useQuery({ queryKey: ["seeker-profile"], queryFn: getMyProfile });
  const [template, setTemplate] = useState<string>("professional");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const profile = profileQ.data?.data;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Resume Builder
      </h1>
      <p className="text-sm text-muted">
        Pick a template and generate a downloadable HTML CV from your profile.
      </p>
      {message && <p className="text-sm text-accent">{message}</p>}

      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTemplate(t.id)}
            className={`rounded-xl border px-3 py-3 text-sm ${
              template === t.id
                ? "border-accent bg-card text-accent"
                : "border-border bg-card"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 text-sm">
        <p>Skills: {(profile?.skills || []).join(", ") || "—"}</p>
        <p className="mt-2">Experience: {profile?.experience?.length || 0}</p>
        <p className="mt-2">Education: {profile?.education?.length || 0}</p>
        <p className="mt-2">Languages: {profile?.languages?.length || 0}</p>
      </div>
      <Button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const res = await generateCvDocument(template);
            await qc.invalidateQueries({ queryKey: ["seeker-profile"] });
            setMessage(
              res.data.cvPdfUrl
                ? `CV saved (${template}): ${res.data.cvPdfUrl}`
                : "Generated",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Generating…" : "Generate & save version"}
      </Button>
      {profile?.cvPdfUrl && (
        <a
          href={profile.cvPdfUrl}
          target="_blank"
          rel="noreferrer"
          className="block text-sm text-accent hover:underline"
        >
          Open / download current CV
        </a>
      )}
    </div>
  );
}
