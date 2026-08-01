"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getEmployerOverview } from "@/lib/employer-api";
import { useAuthStore } from "@/store/auth-store";

export default function EmployerHomePage() {
  const user = useAuthStore((s) => s.user);
  const q = useQuery({
    queryKey: ["employer-overview"],
    queryFn: getEmployerOverview,
  });
  const o = q.data?.data;

  if (q.isLoading) {
    return <p className="text-sm text-muted">Loading overview…</p>;
  }

  const jobs = o?.jobCounts || {};
  const funnel = o?.funnel || {};
  const company = o?.company;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
        Welcome{user?.firstName ? `, ${user.firstName}` : ""}
      </h1>
      <p className="mt-1 text-sm text-muted">
        Recruitment overview for{" "}
        {company?.name || "your company"} — real counts only.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {company ? (
          <>
            <span className="rounded-md border border-border bg-card px-2 py-1 text-xs uppercase">
              {company.verificationStatus || "PENDING"}
            </span>
            {o?.subscription?.planCode && (
              <span className="rounded-md border border-border bg-card px-2 py-1 text-xs">
                Plan: {o.subscription.planCode} ({o.subscription.status})
              </span>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">
            No company yet — create one to post jobs.
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Jobs posted" value={jobs.total ?? 0} href="/dashboard/employer/jobs" />
        <Stat label="Active jobs" value={jobs.published ?? 0} href="/dashboard/employer/jobs" />
        <Stat label="Draft jobs" value={jobs.draft ?? 0} href="/dashboard/employer/jobs/drafts" />
        <Stat label="Featured" value={jobs.featured ?? 0} href="/dashboard/employer/jobs/featured" />
        <Stat label="Closed / expired" value={jobs.closed ?? 0} href="/dashboard/employer/jobs" />
        <Stat label="Total applicants" value={o?.applicantsTotal ?? 0} href="/dashboard/employer/applicants" />
        <Stat label="New today" value={o?.applicantsToday ?? 0} href="/dashboard/employer/applicants" />
        <Stat label="Interviews" value={o?.interviewsScheduled ?? 0} href="/dashboard/employer/interviews" />
        <Stat label="Hires" value={o?.hires ?? 0} href="/dashboard/employer/pipeline" />
        <Stat
          label="Unread"
          value={o?.unreadNotifications ?? 0}
          href="/dashboard/notifications"
        />
      </div>

      {Object.keys(funnel).length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Recruitment funnel</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(funnel).map(([k, v]) => (
              <span
                key={k}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-xs"
              >
                {k.replace(/_/g, " ")}: {v}
              </span>
            ))}
          </div>
        </section>
      )}

      {!!o?.upcomingInterviews?.length && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Calendar</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {o.upcomingInterviews.map((iv) => (
              <li
                key={iv.id}
                className="rounded-lg border border-border px-3 py-2"
              >
                {new Date(iv.scheduledAt).toLocaleString()}
                {iv.recruiterName ? ` · ${iv.recruiterName}` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!!o?.recentActivities?.length && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {o.recentActivities.map((a, i) => (
              <li
                key={`${a.at}-${i}`}
                className="flex justify-between rounded-lg border border-border px-3 py-2"
              >
                <span>
                  <span className="text-xs uppercase text-muted">{a.type}</span>{" "}
                  {a.title}
                </span>
                <span className="text-xs text-muted">
                  {new Date(a.at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/dashboard/employer/company">
          <Button>{company ? "Company profile" : "Create company"}</Button>
        </Link>
        <Link href="/dashboard/employer/jobs/new">
          <Button variant="secondary">Post job</Button>
        </Link>
        <Link href="/dashboard/employer/applicants">
          <Button variant="secondary">Applicants</Button>
        </Link>
        <Link href="/dashboard/employer/analytics">
          <Button variant="secondary">Analytics</Button>
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/40"
    >
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </Link>
  );
}
