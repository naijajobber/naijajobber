"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { parseResume } from "@/lib/ai-api";
import { applyParsedResume, uploadCvFile } from "@/lib/profiles-api";

type Parsed = {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: Array<Record<string, string>>;
  education?: Array<Record<string, string>>;
  certificates?: Array<Record<string, string>>;
};

export default function ResumeParserPage() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Resume Parser
      </h1>
      <p className="text-sm text-muted">
        Upload a resume. Mock AI extracts skills, experience, education, and contact fields.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {message && <p className="text-sm text-accent">{message}</p>}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.html"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          setError(null);
          setMessage(null);
          try {
            const uploaded = await uploadCvFile(file);
            const text = await file.text().catch(() => "");
            const res = await parseResume({
              resumeText: text.slice(0, 15000) || `Resume file ${file.name}`,
              resumeUrl: uploaded.data?.cvPdfUrl,
              fileName: file.name,
            });
            setParsed(res.data as Parsed);
            await qc.invalidateQueries({ queryKey: ["seeker-profile"] });
          } catch (err) {
            setError(
              (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Parse failed",
            );
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
      <Button disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? "Parsing…" : "Upload & parse"}
      </Button>

      {parsed && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4 text-sm">
          <p>
            <strong>Name:</strong> {parsed.name || "—"}
          </p>
          <p>
            <strong>Email:</strong> {parsed.email || "—"}
          </p>
          <p>
            <strong>Phone:</strong> {parsed.phone || "—"}
          </p>
          <p>
            <strong>Skills:</strong> {(parsed.skills || []).join(", ")}
          </p>
          <p>
            <strong>Experience:</strong> {parsed.experience?.length || 0} entries
          </p>
          <p>
            <strong>Education:</strong> {parsed.education?.length || 0} entries
          </p>
          <Button
            onClick={async () => {
              await applyParsedResume(parsed as Record<string, unknown>);
              await qc.invalidateQueries({ queryKey: ["seeker-profile"] });
              await qc.invalidateQueries({ queryKey: ["seeker-me"] });
              setMessage("Profile updated from parsed resume");
            }}
          >
            Apply to profile
          </Button>
        </div>
      )}
    </div>
  );
}
