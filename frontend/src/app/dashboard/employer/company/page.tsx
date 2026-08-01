"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCompany, getMyCompany, updateCompany } from "@/lib/jobs-api";

export default function EmployerCompanyPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-company"],
    queryFn: getMyCompany,
  });
  const company = data?.data;
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    website: "",
    logoUrl: "",
    coverBannerUrl: "",
    description: "",
    industry: "",
    size: "",
    email: "",
    phone: "",
    headquarters: "",
    officeLocations: "",
    yearFounded: "",
    mission: "",
    vision: "",
    coreValues: "",
    linkedin: "",
    twitter: "",
    facebook: "",
    instagram: "",
    youtube: "",
    culturePhotos: "",
    officeImages: "",
    videoUrls: "",
  });

  useEffect(() => {
    if (!company) return;
    setForm({
      name: company.name || "",
      website: company.website || "",
      logoUrl: company.logoUrl || "",
      coverBannerUrl: company.coverBannerUrl || "",
      description: company.description || "",
      industry: company.industry || "",
      size: company.size || "",
      email: company.email || "",
      phone: company.phone || "",
      headquarters: company.headquarters || "",
      officeLocations: (company.officeLocations || []).join("\n"),
      yearFounded: company.yearFounded != null ? String(company.yearFounded) : "",
      mission: company.mission || "",
      vision: company.vision || "",
      coreValues: (company.coreValues || []).join("\n"),
      linkedin: company.socialLinks?.linkedin || "",
      twitter: company.socialLinks?.twitter || "",
      facebook: company.socialLinks?.facebook || "",
      instagram: company.socialLinks?.instagram || "",
      youtube: company.socialLinks?.youtube || "",
      culturePhotos: (company.culturePhotos || []).join("\n"),
      officeImages: (company.officeImages || []).join("\n"),
      videoUrls: (company.videoUrls || []).join("\n"),
    });
  }, [company]);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const lines = (s: string) =>
    s
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

  const payload = () => ({
    name: form.name,
    website: form.website || undefined,
    logoUrl: form.logoUrl || undefined,
    coverBannerUrl: form.coverBannerUrl || undefined,
    description: form.description || undefined,
    industry: form.industry || undefined,
    size: form.size || undefined,
    email: form.email || undefined,
    phone: form.phone || undefined,
    headquarters: form.headquarters || undefined,
    officeLocations: lines(form.officeLocations),
    yearFounded: form.yearFounded ? Number(form.yearFounded) : null,
    mission: form.mission || undefined,
    vision: form.vision || undefined,
    coreValues: lines(form.coreValues),
    socialLinks: {
      linkedin: form.linkedin || undefined,
      twitter: form.twitter || undefined,
      facebook: form.facebook || undefined,
      instagram: form.instagram || undefined,
      youtube: form.youtube || undefined,
    },
    culturePhotos: lines(form.culturePhotos),
    officeImages: lines(form.officeImages),
    videoUrls: lines(form.videoUrls),
  });

  if (isLoading) {
    return <p className="text-sm text-muted">Loading company…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            {company ? "Company profile" : "Create company"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Complete identity, contact, story, and media for your public page.
          </p>
        </div>
        {company?.slug && (
          <Link
            href={`/companies/${company.slug}`}
            className="text-sm text-accent hover:underline"
          >
            Preview public page
          </Link>
        )}
      </div>

      {message && <p className="text-sm text-accent">{message}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <Section title="Identity">
        <Input placeholder="Company name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <Input placeholder="Website" value={form.website} onChange={(e) => set("website", e.target.value)} />
        <Input placeholder="Logo URL" value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} />
        <Input placeholder="Cover banner URL" value={form.coverBannerUrl} onChange={(e) => set("coverBannerUrl", e.target.value)} />
        <Input placeholder="Industry" value={form.industry} onChange={(e) => set("industry", e.target.value)} />
        <Input placeholder="Company size (e.g. 51-200)" value={form.size} onChange={(e) => set("size", e.target.value)} />
        <Input placeholder="Year founded" value={form.yearFounded} onChange={(e) => set("yearFounded", e.target.value)} />
      </Section>

      <Section title="Contact">
        <Input placeholder="Company email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        <Input placeholder="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        <Input placeholder="Headquarters" value={form.headquarters} onChange={(e) => set("headquarters", e.target.value)} />
        <textarea
          className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Office locations (one per line)"
          value={form.officeLocations}
          onChange={(e) => set("officeLocations", e.target.value)}
        />
      </Section>

      <Section title="Story">
        <textarea
          className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
        <textarea
          className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Mission"
          value={form.mission}
          onChange={(e) => set("mission", e.target.value)}
        />
        <textarea
          className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Vision"
          value={form.vision}
          onChange={(e) => set("vision", e.target.value)}
        />
        <textarea
          className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Core values (one per line)"
          value={form.coreValues}
          onChange={(e) => set("coreValues", e.target.value)}
        />
      </Section>

      <Section title="Social links">
        <Input placeholder="LinkedIn" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
        <Input placeholder="Twitter / X" value={form.twitter} onChange={(e) => set("twitter", e.target.value)} />
        <Input placeholder="Facebook" value={form.facebook} onChange={(e) => set("facebook", e.target.value)} />
        <Input placeholder="Instagram" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
        <Input placeholder="YouTube" value={form.youtube} onChange={(e) => set("youtube", e.target.value)} />
      </Section>

      <Section title="Media (URLs, one per line)">
        <textarea
          className="min-h-16 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Culture photo URLs"
          value={form.culturePhotos}
          onChange={(e) => set("culturePhotos", e.target.value)}
        />
        <textarea
          className="min-h-16 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Office image URLs"
          value={form.officeImages}
          onChange={(e) => set("officeImages", e.target.value)}
        />
        <textarea
          className="min-h-16 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Video URLs"
          value={form.videoUrls}
          onChange={(e) => set("videoUrls", e.target.value)}
        />
      </Section>

      <Button
        onClick={async () => {
          setError(null);
          setMessage(null);
          try {
            if (company?._id) {
              await updateCompany(company._id, payload());
            } else {
              await createCompany(payload());
            }
            await qc.invalidateQueries({ queryKey: ["my-company"] });
            setMessage("Company saved");
          } catch (err) {
            setError(
              (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Save failed",
            );
          }
        }}
      >
        {company ? "Save profile" : "Create company"}
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
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
