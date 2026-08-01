"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyToJob, getJobBySlug } from "@/lib/jobs-api";
import { getMyProfile, saveJob } from "@/lib/profiles-api";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  coverLetter: z.string().max(5000).optional(),
  resumeUrl: z.string().url().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function JobDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["job", params.slug],
    queryFn: () => getJobBySlug(params.slug),
    enabled: !!params.slug,
  });

  const job = data?.data;
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [aiBusy, setAiBusy] = useState(false);

  useEffect(() => {
    if (user?.role !== "JOB_SEEKER") return;
    void getMyProfile()
      .then((res) => {
        if (res.data.cvPdfUrl) {
          setValue("resumeUrl", res.data.cvPdfUrl);
        }
      })
      .catch(() => undefined);
  }, [user, setValue]);

  const draftCover = async () => {
    if (!job) return;
    setAiBusy(true);
    setError(null);
    try {
      const { generateCoverLetter } = await import("@/lib/ai-api");
      const res = await generateCoverLetter({ jobId: job._id });
      setValue("coverLetter", res.data.letter);
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Could not draft cover letter",
      );
    } finally {
      setAiBusy(false);
    }
  };

  const onApply = handleSubmit(async (values) => {
    setError(null);
    setMessage(null);
    if (!user) {
      router.push(`/login?next=/jobs/${params.slug}`);
      return;
    }
    if (user.role !== "JOB_SEEKER") {
      setError("Only job seeker accounts can apply.");
      return;
    }
    if (!job?._id) return;
    try {
      await applyToJob({
        jobId: job._id,
        coverLetter: values.coverLetter,
        resumeUrl: values.resumeUrl || undefined,
      });
      setMessage("Application submitted.");
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Could not apply",
      );
    }
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/jobs" className="text-sm text-accent hover:underline">
          ← Back to jobs
        </Link>
        {isLoading && <p className="mt-8 text-muted">Loading…</p>}
        {isError && (
          <p className="mt-8 text-red-500">Job not found or API unavailable.</p>
        )}
        {job && (
          <article className="mt-6">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
              {job.title}
            </h1>
            <p className="mt-2 text-muted">
              {job.category} · {job.workplaceType} · {job.location}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.skills?.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-border px-2 py-1 text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {job.description}
            </div>

            {user?.role === "JOB_SEEKER" && (
              <Button
                className="mt-4"
                variant="secondary"
                size="sm"
                onClick={async () => {
                  try {
                    await saveJob(job._id);
                    setMessage("Job saved.");
                  } catch (err) {
                    setError(
                      (err as { response?: { data?: { message?: string } } })
                        ?.response?.data?.message || "Could not save job",
                    );
                  }
                }}
              >
                Save job
              </Button>
            )}

            {job.easyApply ? (
              <form
                onSubmit={onApply}
                className="mt-10 space-y-4 rounded-xl border border-border bg-card p-6"
              >
                <h2 className="text-lg font-semibold">Easy apply</h2>
                <textarea
                  className="min-h-28 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Cover letter (optional)"
                  {...register("coverLetter")}
                />
                {user?.role === "JOB_SEEKER" && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={aiBusy}
                    onClick={() => void draftCover()}
                  >
                    {aiBusy ? "Drafting…" : "Draft with AI"}
                  </Button>
                )}
                <Input
                  placeholder="Resume URL (optional)"
                  {...register("resumeUrl")}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                {message && <p className="text-sm text-accent">{message}</p>}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting…" : "Submit application"}
                </Button>
              </form>
            ) : (
              <a
                href={job.externalApplyUrl || "#"}
                className="mt-10 inline-block"
                target="_blank"
                rel="noreferrer"
              >
                <Button>Apply externally</Button>
              </a>
            )}
          </article>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
