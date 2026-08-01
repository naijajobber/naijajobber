"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getAdminSettings, patchAdminSettings } from "@/lib/admin-api";

export default function AdminFeatureFlagsPage() {
  const qc = useQueryClient();
  const settingsQ = useQuery({
    queryKey: ["admin-settings"],
    queryFn: getAdminSettings,
  });
  const settings =
    (settingsQ.data as { data?: { featureFlags?: Record<string, boolean> } })
      ?.data ||
    (settingsQ.data as { featureFlags?: Record<string, boolean> });

  const [flags, setFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (settings?.featureFlags) setFlags(settings.featureFlags);
  }, [settingsQ.dataUpdatedAt]);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Feature flags
      </h1>
      <p className="mt-1 text-sm text-muted">
        Stored on PlatformSettings (e.g. job moderation gate).
      </p>

      <div className="mt-6 space-y-3">
        {Object.entries(flags).map(([key, value]) => (
          <label
            key={key}
            className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm"
          >
            <span>{key}</span>
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) =>
                setFlags((f) => ({ ...f, [key]: e.target.checked }))
              }
            />
          </label>
        ))}
        {Object.keys(flags).length === 0 && !settingsQ.isLoading && (
          <p className="text-sm text-muted">No flags yet — save defaults.</p>
        )}
      </div>

      <Button
        className="mt-6"
        onClick={async () => {
          const next = {
            ...flags,
            jobModerationRequired: flags.jobModerationRequired ?? false,
          };
          await patchAdminSettings({ featureFlags: next });
          void qc.invalidateQueries({ queryKey: ["admin-settings"] });
        }}
      >
        Save flags
      </Button>
    </div>
  );
}
