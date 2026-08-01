"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMe } from "@/lib/api";
import { getMyProfile, updateMyProfile, updateSettings } from "@/lib/profiles-api";

export default function CompleteProfilePage() {
  const qc = useQueryClient();
  const profileQ = useQuery({ queryKey: ["seeker-profile"], queryFn: getMyProfile });
  const meQ = useQuery({ queryKey: ["seeker-me"], queryFn: getMe });
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    bio: "",
    phone: "",
    location: "",
    address: "",
    country: "",
    nationality: "",
    avatarUrl: "",
    currentJobTitle: "",
    employmentStatus: "",
    yearsOfExperience: "",
    preferredSalary: "",
    preferredJobType: "",
    preferredTimezone: "",
    preferredCountry: "",
    preferredIndustry: "",
    visibility: "PRIVATE",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const me = meQ.data?.data as Record<string, unknown> | undefined;
    if (me) {
      setForm((f) => ({
        ...f,
        firstName: String(me.firstName || ""),
        lastName: String(me.lastName || ""),
        headline: String(me.headline || ""),
        bio: String(me.bio || ""),
        phone: String(me.phone || ""),
        location: String(me.location || ""),
        address: String(me.address || ""),
        country: String(me.country || ""),
        nationality: String(me.nationality || ""),
        avatarUrl: String(me.avatarUrl || ""),
      }));
    }
  }, [meQ.data]);

  useEffect(() => {
    const p = profileQ.data?.data;
    if (!p) return;
    setForm((f) => ({
      ...f,
      visibility: p.visibility || "PRIVATE",
      currentJobTitle: p.currentJobTitle || "",
      employmentStatus: p.employmentStatus || "",
      yearsOfExperience:
        p.yearsOfExperience != null ? String(p.yearsOfExperience) : "",
      preferredSalary: p.preferredSalary || "",
      preferredJobType: p.preferredJobType || "",
      preferredTimezone: p.preferredTimezone || "",
      preferredCountry: p.preferredCountry || "",
      preferredIndustry: p.preferredIndustry || "",
    }));
  }, [profileQ.data]);

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (profileQ.isLoading || meQ.isLoading) {
    return <p className="text-sm text-muted">Loading profile…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Complete Profile
        </h1>
        <p className="mt-1 text-sm text-muted">
          Keep your professional profile up to date. Changes update completion %.
        </p>
      </div>
      {message && <p className="text-sm text-accent">{message}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <Section title="Personal information">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="First name" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
          <Input placeholder="Last name" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
        </div>
        <Input placeholder="Profile photo URL" value={form.avatarUrl} onChange={(e) => set("avatarUrl", e.target.value)} />
        <Input placeholder="Current job title" value={form.currentJobTitle} onChange={(e) => set("currentJobTitle", e.target.value)} />
        <Input placeholder="Headline" value={form.headline} onChange={(e) => set("headline", e.target.value)} />
        <textarea
          className="min-h-28 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Professional summary"
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
        />
      </Section>

      <Section title="Contact & address">
        <Input placeholder="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        <Input placeholder="City / location" value={form.location} onChange={(e) => set("location", e.target.value)} />
        <Input placeholder="Address" value={form.address} onChange={(e) => set("address", e.target.value)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Country" value={form.country} onChange={(e) => set("country", e.target.value)} />
          <Input placeholder="Nationality" value={form.nationality} onChange={(e) => set("nationality", e.target.value)} />
        </div>
      </Section>

      <Section title="Preferences">
        <select
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={form.employmentStatus}
          onChange={(e) => set("employmentStatus", e.target.value)}
        >
          <option value="">Employment status</option>
          <option value="EMPLOYED">Employed</option>
          <option value="OPEN">Open to work</option>
          <option value="FREELANCE">Freelance</option>
          <option value="STUDENT">Student</option>
        </select>
        <Input
          type="number"
          placeholder="Years of experience"
          value={form.yearsOfExperience}
          onChange={(e) => set("yearsOfExperience", e.target.value)}
        />
        <Input placeholder="Preferred salary" value={form.preferredSalary} onChange={(e) => set("preferredSalary", e.target.value)} />
        <Input placeholder="Preferred job type" value={form.preferredJobType} onChange={(e) => set("preferredJobType", e.target.value)} />
        <Input placeholder="Preferred timezone" value={form.preferredTimezone} onChange={(e) => set("preferredTimezone", e.target.value)} />
        <Input placeholder="Preferred country" value={form.preferredCountry} onChange={(e) => set("preferredCountry", e.target.value)} />
        <Input placeholder="Preferred industry" value={form.preferredIndustry} onChange={(e) => set("preferredIndustry", e.target.value)} />
        <select
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={form.visibility}
          onChange={(e) => set("visibility", e.target.value)}
        >
          <option value="PRIVATE">Visibility: Private</option>
          <option value="EMPLOYERS">Visibility: Employers</option>
          <option value="PUBLIC">Visibility: Public</option>
        </select>
      </Section>

      <Button
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          setMessage(null);
          setError(null);
          try {
            await updateSettings({
              firstName: form.firstName,
              lastName: form.lastName,
              headline: form.headline,
              bio: form.bio,
              phone: form.phone,
              location: form.location,
              address: form.address,
              country: form.country,
              nationality: form.nationality,
              avatarUrl: form.avatarUrl,
            });
            await updateMyProfile({
              visibility: form.visibility as "PRIVATE" | "EMPLOYERS" | "PUBLIC",
              currentJobTitle: form.currentJobTitle,
              employmentStatus: form.employmentStatus,
              yearsOfExperience: form.yearsOfExperience
                ? Number(form.yearsOfExperience)
                : null,
              preferredSalary: form.preferredSalary,
              preferredJobType: form.preferredJobType,
              preferredTimezone: form.preferredTimezone,
              preferredCountry: form.preferredCountry,
              preferredIndustry: form.preferredIndustry,
            });
            await qc.invalidateQueries({ queryKey: ["seeker-profile"] });
            await qc.invalidateQueries({ queryKey: ["seeker-me"] });
            setMessage("Profile saved");
          } catch (err) {
            setError(
              (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Failed to save",
            );
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? "Saving…" : "Save profile"}
      </Button>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}
