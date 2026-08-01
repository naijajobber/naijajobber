"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMyJobs, updateJob } from "@/lib/jobs-api";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "INTERNSHIP",
    "FREELANCE",
  ]),
  workplaceType: z.enum(["REMOTE", "HYBRID", "ONSITE"]),
  location: z.string().optional(),
  category: z.string().optional(),
  skills: z.string().optional(),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isUrgent: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function EditJobPage() {
  const params = useParams();
  const id = String(params.id || "");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const jobsQ = useQuery({ queryKey: ["my-jobs"], queryFn: getMyJobs });
  const job = jobsQ.data?.data?.find((j) => j._id === id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!job) return;
    reset({
      title: job.title,
      description: job.description,
      employmentType: job.employmentType as FormValues["employmentType"],
      workplaceType: job.workplaceType as FormValues["workplaceType"],
      location: job.location || "",
      category: job.category || "",
      skills: (job.skills || []).join(", "),
      salaryMin: job.salaryMin != null ? String(job.salaryMin) : "",
      salaryMax: job.salaryMax != null ? String(job.salaryMax) : "",
      isFeatured: !!job.isFeatured,
      isUrgent: !!job.isUrgent,
    });
  }, [job, reset]);

  if (jobsQ.isLoading) {
    return <p className="text-sm text-muted">Loading job…</p>;
  }

  if (!job) {
    return (
      <div>
        <p className="text-sm text-muted">Job not found.</p>
        <Link href="/dashboard/employer/jobs" className="mt-4 inline-block text-accent hover:underline">
          Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Edit job
      </h1>
      <p className="mt-1 text-sm text-muted">{job.status} · {job.slug}</p>
      <form
        className="mt-8 space-y-4"
        onSubmit={handleSubmit(async (values) => {
          setError(null);
          try {
            await updateJob(id, {
              title: values.title,
              description: values.description,
              employmentType: values.employmentType,
              workplaceType: values.workplaceType,
              location: values.location,
              category: values.category,
              isFeatured: values.isFeatured,
              isUrgent: values.isUrgent,
              skills: values.skills
                ? values.skills.split(",").map((s) => s.trim()).filter(Boolean)
                : [],
              salaryMin: values.salaryMin ? Number(values.salaryMin) : undefined,
              salaryMax: values.salaryMax ? Number(values.salaryMax) : undefined,
            });
            router.push("/dashboard/employer/jobs");
          } catch (err) {
            setError(
              (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Failed to update job",
            );
          }
        })}
      >
        <Input placeholder="Job title" {...register("title")} />
        <textarea
          className="min-h-32 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
          placeholder="Description"
          {...register("description")}
        />
        <select
          className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
          {...register("employmentType")}
        >
          <option value="FULL_TIME">Full time</option>
          <option value="PART_TIME">Part time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="FREELANCE">Freelance</option>
        </select>
        <select
          className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
          {...register("workplaceType")}
        >
          <option value="REMOTE">Remote</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ONSITE">On-site</option>
        </select>
        <Input placeholder="Location" {...register("location")} />
        <Input placeholder="Category" {...register("category")} />
        <Input placeholder="Skills (comma-separated)" {...register("skills")} />
        <div className="grid grid-cols-2 gap-3">
          <Input type="number" placeholder="Salary min" {...register("salaryMin")} />
          <Input type="number" placeholder="Salary max" {...register("salaryMax")} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isFeatured")} /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isUrgent")} /> Sponsored (urgent)
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            Save changes
          </Button>
          <Link href="/dashboard/employer/jobs">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
