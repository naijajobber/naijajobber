"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  getAdminAiUsage,
  getAdminSettings,
  patchAdminSettings,
} from "@/lib/admin-api";

export default function AdminAiPage() {
  const qc = useQueryClient();
  const usageQ = useQuery({
    queryKey: ["admin-ai-usage"],
    queryFn: getAdminAiUsage,
  });
  const settingsQ = useQuery({
    queryKey: ["admin-settings"],
    queryFn: getAdminSettings,
  });

  const usage =
    (usageQ.data as { data?: {
      byType?: Array<{ _id: string; count: number; errors: number; avgTokens: number }>;
      aiMode?: string;
      prompts?: Record<string, string>;
    } })?.data ||
    (usageQ.data as {
      byType?: Array<{ _id: string; count: number; errors: number; avgTokens: number }>;
      aiMode?: string;
      prompts?: Record<string, string>;
    });

  const settings =
    (settingsQ.data as { data?: { aiPrompts?: Record<string, string> } })?.data ||
    (settingsQ.data as { aiPrompts?: Record<string, string> });

  const [prompts, setPrompts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings?.aiPrompts) setPrompts(settings.aiPrompts);
    else if (usage?.prompts) setPrompts(usage.prompts);
  }, [settingsQ.dataUpdatedAt, usageQ.dataUpdatedAt]);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          AI ops
        </h1>
        <p className="mt-1 text-sm text-muted">
          Usage from ai_runs. Mode stays mock unless env changes.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted">AI_MODE</p>
        <p className="mt-1 text-xl font-semibold">{usage?.aiMode || "mock"}</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Usage by type</h2>
        <div className="mt-3 space-y-2">
          {(usage?.byType ?? []).map((t) => (
            <div
              key={t._id}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <p className="font-medium">{t._id}</p>
              <p className="text-xs text-muted">
                {t.count} runs · {t.errors} errors · avg tokens{" "}
                {Math.round(t.avgTokens || 0)}
              </p>
            </div>
          ))}
          {(usage?.byType ?? []).length === 0 && !usageQ.isLoading && (
            <p className="text-sm text-muted">No AI runs yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Prompt templates</h2>
        <div className="mt-3 space-y-3">
          {Object.entries(prompts).map(([key, value]) => (
            <div key={key}>
              <label className="text-xs text-muted">{key}</label>
              <textarea
                className="mt-1 min-h-[72px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                value={value}
                onChange={(e) =>
                  setPrompts((p) => ({ ...p, [key]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
        <Button
          className="mt-4"
          onClick={async () => {
            await patchAdminSettings({ aiPrompts: prompts });
            void qc.invalidateQueries({ queryKey: ["admin-settings"] });
            void qc.invalidateQueries({ queryKey: ["admin-ai-usage"] });
          }}
        >
          Save prompts
        </Button>
      </section>
    </div>
  );
}
