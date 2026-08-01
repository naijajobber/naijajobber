"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getAdminReport } from "@/lib/admin-api";

const TYPES = [
  "users",
  "employers",
  "jobs",
  "applications",
  "revenue",
  "support",
] as const;

export default function AdminReportsPage() {
  const [type, setType] = useState<(typeof TYPES)[number]>("users");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string>("");

  const downloadCsv = async () => {
    setBusy(true);
    try {
      const res = await getAdminReport(type, "csv");
      const csv =
        (res as { data?: { csv?: string } })?.data?.csv ??
        (res as { csv?: string })?.csv ??
        "";
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-report.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setPreview(csv.slice(0, 500));
    } finally {
      setBusy(false);
    }
  };

  const loadJson = async () => {
    setBusy(true);
    try {
      const res = await getAdminReport(type, "json");
      const rows =
        (res as { data?: { data?: unknown[]; rows?: number } })?.data ||
        (res as { data?: unknown[]; rows?: number });
      setPreview(JSON.stringify(rows, null, 2).slice(0, 2000));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Reports
      </h1>
      <p className="mt-1 text-sm text-muted">
        JSON preview or CSV download. Use print for PDF-style output.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <select
          className="h-11 rounded-md border border-border bg-card px-3 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Button disabled={busy} onClick={() => void loadJson()}>
          Preview JSON
        </Button>
        <Button
          disabled={busy}
          variant="secondary"
          onClick={() => void downloadCsv()}
        >
          Download CSV
        </Button>
        <Button
          variant="ghost"
          onClick={() => window.print()}
        >
          Print
        </Button>
      </div>

      {preview && (
        <pre className="mt-6 max-h-[28rem] overflow-auto rounded-xl border border-border bg-card p-4 text-xs">
          {preview}
        </pre>
      )}
    </div>
  );
}
