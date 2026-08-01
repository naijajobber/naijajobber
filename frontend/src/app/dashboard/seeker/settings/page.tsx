"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMe } from "@/lib/api";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/notifications-api";
import { getMyProfile, updateMyProfile, updateSettings } from "@/lib/profiles-api";

const TABS = [
  "Profile",
  "Security",
  "Notifications",
  "Privacy",
  "Theme",
  "Account",
] as const;

export default function SeekerSettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Profile");
  const { theme, setTheme } = useTheme();
  const qc = useQueryClient();
  const meQ = useQuery({ queryKey: ["seeker-me"], queryFn: getMe });
  const profileQ = useQuery({ queryKey: ["seeker-profile"], queryFn: getMyProfile });
  const prefsQ = useQuery({
    queryKey: ["notif-prefs"],
    queryFn: getNotificationPreferences,
  });
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [visibility, setVisibility] = useState("PRIVATE");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const me = meQ.data?.data;
    if (me) {
      setHeadline(String(me.headline || ""));
      setBio(String(me.bio || ""));
      setLocation(String(me.location || ""));
      setPhone(String(me.phone || ""));
    }
  }, [meQ.data]);

  useEffect(() => {
    if (profileQ.data?.data?.visibility) {
      setVisibility(profileQ.data.data.visibility);
    }
  }, [profileQ.data]);

  useEffect(() => {
    const p = prefsQ.data?.data as
      | { emailEnabled?: boolean; inAppEnabled?: boolean }
      | undefined;
    if (p) {
      setEmailEnabled(!!p.emailEnabled);
      setInAppEnabled(p.inAppEnabled !== false);
    }
  }, [prefsQ.data]);

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

      {tab === "Profile" && (
        <section className="mt-6 space-y-3">
          <Input placeholder="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          <textarea
            className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button
            onClick={async () => {
              await updateSettings({ headline, bio, location, phone });
              await qc.invalidateQueries({ queryKey: ["seeker-me"] });
              setMessage("Profile settings saved");
            }}
          >
            Save profile
          </Button>
        </section>
      )}

      {tab === "Security" && (
        <section className="mt-6 space-y-3 text-sm">
          <p className="text-muted">
            Use forgot-password from the login page to reset your password. Session
            devices and 2FA arrive in a later release.
          </p>
          <a href="/forgot-password" className="text-accent hover:underline">
            Reset password
          </a>
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
            Email notifications
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={inAppEnabled}
              onChange={(e) => setInAppEnabled(e.target.checked)}
            />
            In-app notifications
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
            Save prefs
          </Button>
        </section>
      )}

      {tab === "Privacy" && (
        <section className="mt-6 space-y-3">
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="PRIVATE">Private</option>
            <option value="EMPLOYERS">Visible to employers</option>
            <option value="PUBLIC">Public</option>
          </select>
          <Button
            onClick={async () => {
              await updateMyProfile({
                visibility: visibility as "PRIVATE" | "EMPLOYERS" | "PUBLIC",
              });
              await qc.invalidateQueries({ queryKey: ["seeker-profile"] });
              setMessage("Privacy updated");
            }}
          >
            Save privacy
          </Button>
        </section>
      )}

      {tab === "Theme" && (
        <section className="mt-6 flex gap-2">
          <Button
            variant={theme === "light" ? "default" : "secondary"}
            onClick={() => setTheme("light")}
          >
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "secondary"}
            onClick={() => setTheme("dark")}
          >
            Dark
          </Button>
          <Button
            variant={theme === "system" ? "default" : "secondary"}
            onClick={() => setTheme("system")}
          >
            System
          </Button>
        </section>
      )}

      {tab === "Account" && (
        <section className="mt-6 space-y-3 text-sm">
          <p className="text-muted">
            Deactivate or delete account: contact support or an admin soft-delete
            in this release. Export of personal data is planned.
          </p>
          <p>
            Signed in as{" "}
            <strong>{String(meQ.data?.data?.email || "—")}</strong>
          </p>
        </section>
      )}
    </div>
  );
}
