"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  generateAdminApiKey,
  getAdminSettings,
  patchAdminSettings,
  revokeAdminApiKey,
  type AdminSettings,
} from "@/lib/admin-api";

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const settingsQ = useQuery({
    queryKey: ["admin-settings"],
    queryFn: getAdminSettings,
  });
  const raw =
    (settingsQ.data as { data?: AdminSettings })?.data ||
    (settingsQ.data as AdminSettings) ||
    {};

  const [form, setForm] = useState<AdminSettings>({});
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  useEffect(() => {
    if (raw && Object.keys(raw).length) setForm(raw);
  }, [settingsQ.dataUpdatedAt]);

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Platform branding, security, and API keys. Secrets stay env-only.
        </p>
      </div>

      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await patchAdminSettings({
            platformName: form.platformName,
            logoUrl: form.logoUrl,
            primaryColor: form.primaryColor,
            accentColor: form.accentColor,
            maintenanceMode: form.maintenanceMode,
            featureFlags: form.featureFlags,
            localization: form.localization,
            security: form.security,
            blockedIps: form.blockedIps,
            aiPrompts: form.aiPrompts,
          });
          void qc.invalidateQueries({ queryKey: ["admin-settings"] });
        }}
      >
        <Input
          placeholder="Platform name"
          value={form.platformName || ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, platformName: e.target.value }))
          }
        />
        <Input
          placeholder="Logo URL"
          value={form.logoUrl || ""}
          onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Primary color"
            value={form.primaryColor || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, primaryColor: e.target.value }))
            }
          />
          <Input
            placeholder="Accent color"
            value={form.accentColor || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, accentColor: e.target.value }))
            }
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!form.maintenanceMode}
            onChange={(e) =>
              setForm((f) => ({ ...f, maintenanceMode: e.target.checked }))
            }
          />
          Maintenance mode
        </label>
        <Input
          type="number"
          placeholder="Password min length"
          value={form.security?.passwordMinLength ?? 8}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              security: {
                ...(f.security || {}),
                passwordMinLength: Number(e.target.value) || 8,
              },
            }))
          }
        />
        <Input
          type="number"
          placeholder="JWT TTL days"
          value={form.security?.jwtTtlDays ?? 7}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              security: {
                ...(f.security || {}),
                jwtTtlDays: Number(e.target.value) || 7,
              },
            }))
          }
        />
        <Input
          placeholder="Blocked IPs (comma-separated)"
          value={(form.blockedIps || []).join(", ")}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              blockedIps: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }))
          }
        />
        <Button type="submit">Save settings</Button>
      </form>

      {form.envConfigured && (
        <section>
          <h2 className="text-lg font-semibold">Env configured</h2>
          <pre className="mt-2 rounded-xl border border-border bg-card p-3 text-xs">
            {JSON.stringify(form.envConfigured, null, 2)}
          </pre>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold">Platform API keys</h2>
        <div className="mt-3 space-y-2">
          {(form.apiKeys || []).map((k) => (
            <div
              key={k.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{k.name}</p>
                <p className="text-xs text-muted">
                  {k.keyPrefix}…{k.revokedAt ? " · revoked" : ""}
                </p>
              </div>
              {!k.revokedAt && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    await revokeAdminApiKey(k.id);
                    void qc.invalidateQueries({ queryKey: ["admin-settings"] });
                  }}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await generateAdminApiKey(newKeyName);
            const key =
              (res as { data?: { apiKey?: string } })?.data?.apiKey ||
              (res as { apiKey?: string })?.apiKey;
            if (key) setRevealedKey(key);
            setNewKeyName("");
            void qc.invalidateQueries({ queryKey: ["admin-settings"] });
          }}
        >
          <Input
            placeholder="Key name"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            required
          />
          <Button type="submit">Generate</Button>
        </form>
        {revealedKey && (
          <p className="mt-2 text-xs text-amber-700">
            Copy now: <code>{revealedKey}</code>
          </p>
        )}
      </section>
    </div>
  );
}
