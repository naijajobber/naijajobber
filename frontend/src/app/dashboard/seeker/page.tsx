"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { computeProfileCompletion } from "@/components/dashboard/profile-completion";
import { Button } from "@/components/ui/button";
import { getMe } from "@/lib/api";
import { listAiRuns, matchJobs } from "@/lib/ai-api";
import { getMyApplications } from "@/lib/jobs-api";
import { unreadNotificationCount } from "@/lib/notifications-api";
import { getMyProfile, listSavedJobs } from "@/lib/profiles-api";
import { listMyInterviews } from "@/lib/seeker-extra-api";
import { useAuthStore } from "@/store/auth-store";

export default function SeekerHomePage() {
  const user = useAuthStore((s) => s.user);
  const profileQ = useQuery({ queryKey: ["seeker-profile"], queryFn: getMyProfile });
  const meQ = useQuery({ queryKey: ["seeker-me"], queryFn: getMe });
  const appsQ = useQuery({ queryKey: ["my-applications"], queryFn: getMyApplications });
  const savedQ = useQuery({ queryKey: ["saved-jobs"], queryFn: listSavedJobs });
  const unreadQ = useQuery({
    queryKey: ["seeker-unread"],
    queryFn: unreadNotificationCount,
  });
  const interviewsQ = useQuery({
    queryKey: ["my-interviews"],
    queryFn: listMyInterviews,
  });
  const runsQ = useQuery({
    queryKey: ["ai-runs"],
    queryFn: () => listAiRuns(),
    enabled: !!user,
  });
  const matchQ = useQuery({
    queryKey: ["home-job-match"],
    queryFn: () => matchJobs({ limit: 5 }),
    enabled: !!user,
    staleTime: 5 * 60_000,
  });

  const me = meQ.data?.data || {};
  const profile = profileQ.data?.data;
  const completion = computeProfileCompletion({
    headline: String(me.headline || ""),
    bio: String(me.bio || ""),
    location: String(me.location || ""),
    phone: String(me.phone || ""),
    avatarUrl: String(me.avatarUrl || ""),
    skills: profile?.skills,
    skillItems: profile?.skillItems,
    experience: profile?.experience,
    education: profile?.education,
    portfolioLinks: profile?.portfolioLinks,
    languages: profile?.languages,
    certificates: profile?.certificates,
    cvPdfUrl: profile?.cvPdfUrl,
    cvFiles: profile?.cvFiles,
  });

  const apps = appsQ.data?.data ?? [];
  const applied = apps.length;
  const saved = (savedQ.data?.data as unknown[] | undefined)?.length ?? 0;
  const unread = unreadQ.data?.data?.count ?? 0;
  const interviews = interviewsQ.data?.data?.length ?? 0;
  const matches = matchQ.data?.data?.matches ?? [];

  const byStatus = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const resumeRun = (
    runsQ.data?.data as Array<{ type?: string; result?: { score?: number } }> | undefined
  )?.find(
    (r) => r.type === "RESUME_REVIEW" || (r.result && "score" in (r.result || {})),
  );
  const resumeScore =
    (resumeRun?.result as { score?: number } | undefined)?.score ?? null;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
        Welcome{user?.firstName ? `, ${user.firstName}` : ""}
      </h1>
      <p className="mt-1 text-sm text-muted">
        Your job search overview — finish your profile, apply, and use AI tools.
      </p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex flex-col items-start">
          <div
            className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-accent/40"
            style={{
              background: `conic-gradient(var(--accent) ${completion.percent}%, var(--border) 0)`,
            }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card text-xl font-bold">
              {completion.percent}%
            </div>
          </div>
          <p className="mt-3 text-sm font-medium">Profile completion</p>
          {completion.next && (
            <p className="mt-1 text-xs text-muted">Next: {completion.next}</p>
          )}
          <Link
            href="/dashboard/seeker/profile/completion"
            className="mt-1 text-xs text-accent hover:underline"
          >
            See what’s missing
          </Link>
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Saved jobs" value={saved} href="/dashboard/seeker/jobs/saved" />
          <Stat label="Applications" value={applied} href="/dashboard/seeker/jobs/applied" />
          <Stat
            label="Interviews"
            value={interviews}
            href="/dashboard/seeker/interviews"
          />
          <Stat label="Unread alerts" value={unread} href="/dashboard/seeker/notifications" />
          <Stat
            label="Resume score"
            value={resumeScore != null ? `${resumeScore}` : "—"}
            href="/dashboard/seeker/ai/resume"
            isText
          />
        </div>
      </div>

      {Object.keys(byStatus).length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Application statistics</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(byStatus).map(([status, count]) => (
              <span
                key={status}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-xs"
              >
                {status.replace(/_/g, " ")}: {count}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recommended jobs</h2>
          <Link
            href="/dashboard/seeker/ai/match"
            className="text-xs text-accent hover:underline"
          >
            Full AI match
          </Link>
        </div>
        {matchQ.isLoading && (
          <p className="mt-3 text-sm text-muted">Finding matches…</p>
        )}
        <ul className="mt-3 space-y-2">
          {matches.map((m) => (
            <li
              key={m.jobId}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{m.title}</p>
                <p className="text-xs text-muted">
                  Score {m.score} · {m.reason}
                </p>
              </div>
              {m.slug ? (
                <Link href={`/jobs/${m.slug}`} className="text-xs text-accent hover:underline">
                  View
                </Link>
              ) : null}
            </li>
          ))}
          {!matchQ.isLoading && !matches.length && (
            <li className="text-sm text-muted">
              No recommendations yet — complete your profile and try AI Match.
            </li>
          )}
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/dashboard/seeker/profile">
          <Button>Complete profile</Button>
        </Link>
        <Link href="/jobs">
          <Button variant="secondary">Browse jobs</Button>
        </Link>
        <Link href="/dashboard/seeker/applications">
          <Button variant="secondary">Tracker</Button>
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  isText,
}: {
  label: string;
  value: number | string;
  href: string;
  isText?: boolean;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/40"
    >
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 font-semibold ${isText ? "text-lg" : "text-2xl"}`}>
        {value}
      </p>
    </Link>
  );
}
