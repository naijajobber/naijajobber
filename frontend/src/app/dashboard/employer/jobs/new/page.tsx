"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createJob } from "@/lib/jobs-api";

export default function NewJobPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    department: "",
    category: "Software Engineering",
    employmentType: "FULL_TIME",
    workplaceType: "REMOTE",
    experienceLevel: "MID",
    location: "",
    country: "",
    timezone: "UTC",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    openings: "1",
    skills: "",
    preferredSkills: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
    hiringProcess: "",
    deadline: "",
    tags: "",
    screeningPrompt: "",
    scheduledPublishAt: "",
    isFeatured: false,
    isUrgent: false,
  });

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Post a job
      </h1>
      <p className="text-sm text-muted">
        Saves as DRAFT unless a past/empty schedule publish date is set after verification.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}

      <Input placeholder="Job title" value={form.title} onChange={(e) => set("title", e.target.value)} />
      <Input placeholder="Department" value={form.department} onChange={(e) => set("department", e.target.value)} />
      <Input placeholder="Category" value={form.category} onChange={(e) => set("category", e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="h-11 rounded-md border border-border bg-background px-3 text-sm" value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)}>
          {["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"].map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>
        <select className="h-11 rounded-md border border-border bg-background px-3 text-sm" value={form.workplaceType} onChange={(e) => set("workplaceType", e.target.value)}>
          {["REMOTE", "HYBRID", "ONSITE"].map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>
      </div>
      <select className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm" value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)}>
        {["INTERN", "JUNIOR", "MID", "SENIOR", "LEAD"].map((x) => (
          <option key={x} value={x}>{x}</option>
        ))}
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="Location" value={form.location} onChange={(e) => set("location", e.target.value)} />
        <Input placeholder="Country" value={form.country} onChange={(e) => set("country", e.target.value)} />
      </div>
      <Input placeholder="Timezone" value={form.timezone} onChange={(e) => set("timezone", e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Input placeholder="Salary min" value={form.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} />
        <Input placeholder="Salary max" value={form.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} />
        <Input placeholder="Currency" value={form.salaryCurrency} onChange={(e) => set("salaryCurrency", e.target.value)} />
      </div>
      <Input placeholder="Openings" value={form.openings} onChange={(e) => set("openings", e.target.value)} />
      <Input placeholder="Required skills (comma-separated)" value={form.skills} onChange={(e) => set("skills", e.target.value)} />
      <Input placeholder="Preferred skills" value={form.preferredSkills} onChange={(e) => set("preferredSkills", e.target.value)} />
      <textarea className="min-h-28 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={(e) => set("description", e.target.value)} />
      <textarea className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Responsibilities" value={form.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} />
      <textarea className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Requirements" value={form.requirements} onChange={(e) => set("requirements", e.target.value)} />
      <textarea className="min-h-16 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Benefits" value={form.benefits} onChange={(e) => set("benefits", e.target.value)} />
      <textarea className="min-h-16 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Hiring process" value={form.hiringProcess} onChange={(e) => set("hiringProcess", e.target.value)} />
      <Input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
      <Input placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
      <Input placeholder="Screening question (optional)" value={form.screeningPrompt} onChange={(e) => set("screeningPrompt", e.target.value)} />
      <Input type="datetime-local" value={form.scheduledPublishAt} onChange={(e) => set("scheduledPublishAt", e.target.value)} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} /> Featured
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isUrgent} onChange={(e) => set("isUrgent", e.target.checked)} /> Sponsored / urgent
      </label>

      <div className="flex gap-2">
        <Button
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            setError(null);
            try {
              await createJob({
                title: form.title,
                description: form.description,
                department: form.department,
                category: form.category,
                employmentType: form.employmentType,
                workplaceType: form.workplaceType,
                experienceLevel: form.experienceLevel,
                location: form.location,
                country: form.country,
                timezone: form.timezone,
                openings: Number(form.openings) || 1,
                skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
                preferredSkills: form.preferredSkills.split(",").map((s) => s.trim()).filter(Boolean),
                responsibilities: form.responsibilities,
                requirements: form.requirements,
                benefits: form.benefits,
                hiringProcess: form.hiringProcess,
                deadline: form.deadline || undefined,
                tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
                screeningQuestions: form.screeningPrompt
                  ? [{ id: "q1", prompt: form.screeningPrompt, type: "text" }]
                  : [],
                scheduledPublishAt: form.scheduledPublishAt || undefined,
                salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
                salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
                salaryCurrency: form.salaryCurrency,
                isFeatured: form.isFeatured,
                isUrgent: form.isUrgent,
              });
              router.push("/dashboard/employer/jobs/drafts");
            } catch (err) {
              setError(
                (err as { response?: { data?: { message?: string } } })?.response
                  ?.data?.message || "Failed to create job",
              );
            } finally {
              setSaving(false);
            }
          }}
        >
          Save draft
        </Button>
        <Link href="/dashboard/employer/jobs">
          <Button variant="secondary">Cancel</Button>
        </Link>
      </div>
    </div>
  );
}
