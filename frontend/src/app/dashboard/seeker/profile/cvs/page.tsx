"use client";

import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  deleteCvFile,
  getMyProfile,
  replaceCvFile,
  setPrimaryCv,
  uploadCvFile,
} from "@/lib/profiles-api";

export default function UploadCvsPage() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [replaceUrl, setReplaceUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const profileQ = useQuery({ queryKey: ["seeker-profile"], queryFn: getMyProfile });
  const files = profileQ.data?.data?.cvFiles || [];
  const primary = profileQ.data?.data?.cvPdfUrl || "";

  const refresh = () => qc.invalidateQueries({ queryKey: ["seeker-profile"] });

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Upload CVs
      </h1>
      <p className="text-sm text-muted">
        Upload, replace, preview, download, or set a default resume.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.html,application/pdf"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          setError(null);
          try {
            await uploadCvFile(file);
            await refresh();
          } catch (err) {
            setError(
              (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Upload failed",
            );
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
      <input
        ref={replaceRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.html,application/pdf"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !replaceUrl) return;
          setBusy(true);
          try {
            await replaceCvFile(replaceUrl, file);
            await refresh();
          } catch (err) {
            setError(
              (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Replace failed",
            );
          } finally {
            setBusy(false);
            setReplaceUrl(null);
            e.target.value = "";
          }
        }}
      />
      <Button disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? "Working…" : "Upload CV"}
      </Button>
      <ul className="space-y-2 text-sm">
        {files.map((f) => (
          <li
            key={f.url}
            className="rounded-lg border border-border px-3 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <a href={f.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                  {f.name || f.url}
                </a>
                <p className="text-xs text-muted">
                  v{f.version || 1}
                  {f.uploadedAt
                    ? ` · ${new Date(f.uploadedAt).toLocaleDateString()}`
                    : ""}
                  {primary === f.url || f.isDefault ? " · Default" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={f.url} download className="text-xs text-accent hover:underline">
                  Download
                </a>
                {primary !== f.url && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      await setPrimaryCv(f.url);
                      await refresh();
                    }}
                  >
                    Set default
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReplaceUrl(f.url);
                    replaceRef.current?.click();
                  }}
                >
                  Replace
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    if (!confirm("Delete this CV?")) return;
                    await deleteCvFile(f.url);
                    await refresh();
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </li>
        ))}
        {!files.length && (
          <li className="text-muted">No CVs uploaded yet.</li>
        )}
      </ul>
    </div>
  );
}
