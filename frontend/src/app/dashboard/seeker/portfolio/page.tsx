"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMyProfile, updateMyProfile } from "@/lib/profiles-api";

const LINK_TYPES = ["GitHub", "Behance", "Dribbble", "Website", "Other"] as const;

type PortfolioRow = { type: string; url: string };

function parseLinks(raw: string[] | undefined): PortfolioRow[] {
  return (raw || []).map((line) => {
    const m = line.match(/^\[([^\]]+)\]\s*(.+)$/);
    if (m) return { type: m[1], url: m[2].trim() };
    return { type: "Website", url: line };
  });
}

function serializeLinks(rows: PortfolioRow[]): string[] {
  return rows
    .filter((r) => r.url.trim())
    .map((r) => `[${r.type}] ${r.url.trim()}`);
}

export default function PortfolioPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["seeker-profile"], queryFn: getMyProfile });
  const [rows, setRows] = useState<PortfolioRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setRows(parseLinks(q.data?.data?.portfolioLinks));
  }, [q.data]);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Portfolio
      </h1>
      <p className="text-sm text-muted">
        Add project and profile links by type (GitHub, Behance, etc.).
      </p>
      {message && <p className="text-sm text-accent">{message}</p>}
      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div key={idx} className="flex flex-wrap gap-2">
            <select
              className="h-10 rounded-md border border-border bg-background px-2 text-sm"
              value={row.type}
              onChange={(e) => {
                const next = [...rows];
                next[idx] = { ...row, type: e.target.value };
                setRows(next);
              }}
            >
              {LINK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Input
              className="min-w-[12rem] flex-1"
              placeholder="https://…"
              value={row.url}
              onChange={(e) => {
                const next = [...rows];
                next[idx] = { ...row, url: e.target.value };
                setRows(next);
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRows(rows.filter((_, i) => i !== idx))}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => setRows([...rows, { type: "Website", url: "" }])}
        >
          Add link
        </Button>
        <Button
          onClick={async () => {
            await updateMyProfile({ portfolioLinks: serializeLinks(rows) });
            await qc.invalidateQueries({ queryKey: ["seeker-profile"] });
            setMessage("Portfolio saved");
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
