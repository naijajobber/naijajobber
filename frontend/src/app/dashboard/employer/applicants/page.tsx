"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  createInterview,
  listCompanyApplications,
  matchCandidates,
} from "@/lib/employer-api";
import { updateApplicationStatus } from "@/lib/jobs-api";
import { openConversation } from "@/lib/messages-api";
import { getMyJobs } from "@/lib/jobs-api";

const ACTIONS = [
  { status: "UNDER_REVIEW", label: "Screen" },
  { status: "ASSESSMENT", label: "Assessment" },
  { status: "INTERVIEW", label: "Interview" },
  { status: "OFFER", label: "Offer" },
  { status: "HIRED", label: "Hire" },
  { status: "REJECTED", label: "Reject" },
];

export default function ApplicantsPage() {
  const router = useRouter();
  const [jobFilter, setJobFilter] = useState("");
  const [q, setQ] = useState("");
  const [matchMsg, setMatchMsg] = useState<string | null>(null);

  const jobsQ = useQuery({ queryKey: ["my-jobs"], queryFn: getMyJobs });
  const appsQ = useQuery({
    queryKey: ["company-apps"],
    queryFn: listCompanyApplications,
  });

  const apps = useMemo(() => {
    const list = (appsQ.data?.data as Array<{
      _id: string;
      jobId: string;
      status: string;
      coverLetter?: string;
      resumeUrl?: string;
      expectedSalary?: string;
      seeker?: {
        firstName?: string;
        lastName?: string;
        avatarUrl?: string;
        location?: string;
        skills?: string[];
        availabilityStatus?: string;
      };
      job?: { title?: string };
    }> | undefined) || [];
    return list.filter((a) => {
      if (jobFilter && a.jobId !== jobFilter) return false;
      if (!q) return true;
      const name = `${a.seeker?.firstName || ""} ${a.seeker?.lastName || ""}`.toLowerCase();
      return (
        name.includes(q.toLowerCase()) ||
        (a.seeker?.skills || []).some((s) =>
          s.toLowerCase().includes(q.toLowerCase()),
        )
      );
    });
  }, [appsQ.data, jobFilter, q]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Manage applicants
      </h1>
      <p className="text-sm text-muted">
        Review candidates across jobs — message, move stage, schedule, hire.
      </p>
      {matchMsg && <p className="text-sm text-accent">{matchMsg}</p>}

      <div className="flex flex-wrap gap-2">
        <select
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
        >
          <option value="">All jobs</option>
          {(jobsQ.data?.data || []).map((j) => (
            <option key={j._id} value={j._id}>
              {j.title}
            </option>
          ))}
        </select>
        <input
          className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm"
          placeholder="Search name or skills"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {jobFilter && (
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              const res = await matchCandidates(jobFilter);
              const matches = (res as { data?: { matches?: unknown[] } })?.data
                ?.matches;
              setMatchMsg(
                `AI ranked ${Array.isArray(matches) ? matches.length : 0} candidates (mock)`,
              );
            }}
          >
            AI match
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {apps.map((app) => {
          const name =
            [app.seeker?.firstName, app.seeker?.lastName]
              .filter(Boolean)
              .join(" ") || "Candidate";
          return (
            <article
              key={app._id}
              className="rounded-xl border border-border bg-card p-4 text-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  {app.seeker?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.seeker.avatarUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-xs">
                      {name.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-xs text-muted">
                      {app.job?.title || "Job"} · {app.status.replace(/_/g, " ")}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {app.seeker?.location || "—"} ·{" "}
                      {app.seeker?.availabilityStatus || "Availability n/a"}
                      {app.expectedSalary ? ` · ${app.expectedSalary}` : ""}
                    </p>
                    {!!app.seeker?.skills?.length && (
                      <p className="mt-1 text-xs text-muted">
                        {(app.seeker.skills || []).slice(0, 6).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {app.resumeUrl && (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border border-border px-2 py-1 text-xs text-accent"
                    >
                      Resume
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      await openConversation(app._id);
                      router.push("/dashboard/messages");
                    }}
                  >
                    Message
                  </Button>
                  {ACTIONS.map((a) => (
                    <Button
                      key={a.status}
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await updateApplicationStatus(app._id, {
                          status: a.status,
                        });
                        if (a.status === "INTERVIEW") {
                          await createInterview({
                            applicationId: app._id,
                            jobId: app.jobId,
                            scheduledAt: new Date(
                              Date.now() + 3 * 86400000,
                            ).toISOString(),
                            interviewType: "TECHNICAL",
                          });
                        }
                        void appsQ.refetch();
                      }}
                    >
                      {a.label}
                    </Button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
        {!apps.length && !appsQ.isLoading && (
          <p className="text-sm text-muted">No applicants found.</p>
        )}
      </div>
    </div>
  );
}
