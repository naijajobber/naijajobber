"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  generateApiKey,
  registerWebhook,
  updateIntegrations,
} from "@/lib/employer-api";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/notifications-api";
import { getMyCompany } from "@/lib/jobs-api";

const TABS = [
  "Company",
  "Security",
  "Notifications",
  "Integrations",
  "API Keys",
  "Theme",
  "Account",
] as const;

export default function EmployerSettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Company");
  const { theme, setTheme } = useTheme();
  const qc = useQueryClient();
  const companyQ = useQuery({ queryKey: ["my-company"], queryFn: getMyCompany });
  const prefsQ = useQuery({
    queryKey: ["notif-prefs"],
    queryFn: getNotificationPreferences,
  });
  const company = companyQ.data?.data;
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [apiLabel, setApiLabel] = useState("production");
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [integrations, setIntegrations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const p = prefsQ.data?.data;
    if (p) {
      setEmailEnabled(!!p.emailEnabled);
      setInAppEnabled(p.inAppEnabled !== false);
    }
  }, [prefsQ.data]);

  useEffect(() => {
    if (company?.integrations) setIntegrations({ ...company.integrations });
  }, [company]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Settings
      </h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button
            key={t}
            size="sm"
            variant={tab === t ? "default" : "secondary"}
            onClick={() => setTab(t)}
          >
            {t}
          </Button>
        ))}
      </div>
      {message && <p className="mt-4 text-sm text-accent">{message}</p>}

      {tab === "Company" && (
        <section className="mt-6 space-y-3 text-sm">
          <p className="text-muted">
            Profile, branding, team, and billing live on dedicated pages.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/employer/company">
              <Button size="sm">Company profile</Button>
            </Link>
            <Link href="/dashboard/employer/team">
              <Button size="sm" variant="secondary">
                Team
              </Button>
            </Link>
            <Link href="/dashboard/employer/billing">
              <Button size="sm" variant="secondary">
                Billing
              </Button>
            </Link>
          </div>
        </section>
      )}

      {tab === "Security" && (
        <section className="mt-6 text-sm text-muted">
          Reset password via{" "}
          <a href="/forgot-password" className="text-accent hover:underline">
            forgot password
          </a>
          . 2FA and session devices arrive later.
        </section>
      )}

      {tab === "Notifications" && (
        <section className="mt-6 space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
            />
            Email
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={inAppEnabled}
              onChange={(e) => setInAppEnabled(e.target.checked)}
            />
            In-app
          </label>
          <Button
            onClick={async () => {
              await updateNotificationPreferences({
                emailEnabled,
                inAppEnabled,
              });
              setMessage("Notification prefs saved");
            }}
          >
            Save
          </Button>
        </section>
      )}

      {tab === "Integrations" && (
        <section className="mt-6 space-y-3">
          {[
            "googleCalendar",
            "outlook",
            "slack",
            "teams",
            "zoom",
            "meet",
            "linkedin",
            "github",
            "zapier",
          ].map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!integrations[key]}
                onChange={(e) =>
                  setIntegrations({ ...integrations, [key]: e.target.checked })
                }
              />
              {key}
            </label>
          ))}
          <Button
            onClick={async () => {
              await updateIntegrations(integrations);
              await qc.invalidateQueries({ queryKey: ["my-company"] });
              setMessage("Integrations updated (mock flags)");
            }}
          >
            Save integrations
          </Button>
          <div className="pt-4">
            <Input
              placeholder="Webhook URL"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <Button
              className="mt-2"
              variant="secondary"
              onClick={async () => {
                await registerWebhook({
                  url: webhookUrl,
                  events: ["application.created"],
                });
                setMessage("Webhook registered (store only)");
              }}
            >
              Register webhook
            </Button>
          </div>
        </section>
      )}

      {tab === "API Keys" && (
        <section className="mt-6 space-y-3">
          <Input
            placeholder="Label"
            value={apiLabel}
            onChange={(e) => setApiLabel(e.target.value)}
          />
          <Button
            onClick={async () => {
              const res = await generateApiKey(apiLabel);
              const key = (res as { data?: { apiKey?: string } })?.data?.apiKey;
              setRawKey(key || null);
              setMessage("API key generated — copy now");
              await qc.invalidateQueries({ queryKey: ["my-company"] });
            }}
          >
            Generate key
          </Button>
          {rawKey && (
            <p className="break-all rounded border border-border bg-card p-2 text-xs">
              {rawKey}
            </p>
          )}
          <p className="text-xs text-muted">
            Rate limits (documented): 100 req/min mock. Live delivery not enabled.
          </p>
        </section>
      )}

      {tab === "Theme" && (
        <section className="mt-6 flex gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <Button
              key={t}
              variant={theme === t ? "default" : "secondary"}
              onClick={() => setTheme(t)}
            >
              {t}
            </Button>
          ))}
        </section>
      )}

      {tab === "Account" && (
        <section className="mt-6 space-y-3 text-sm">
          <p className="text-muted">
            Soft-delete company by contacting support/admin in this release.
            Deactivate membership via Team page.
          </p>
          {company && (
            <p>
              Company: <strong>{company.name}</strong> ({company.slug})
            </p>
          )}
        </section>
      )}
    </div>
  );
}
