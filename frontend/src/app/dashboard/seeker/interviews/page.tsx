"use client";

import { useQuery } from "@tanstack/react-query";
import { listMyInterviews } from "@/lib/seeker-extra-api";

export default function InterviewsPage() {
  const q = useQuery({ queryKey: ["my-interviews"], queryFn: listMyInterviews });
  const items = q.data?.data ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Interview Schedule
      </h1>
      <p className="mt-1 text-sm text-muted">
        Upcoming interviews invited by employers.
      </p>

      <div className="mt-6 space-y-3">
        {items.map((iv) => {
          const start = new Date(iv.scheduledAt);
          const end = new Date(start.getTime() + 60 * 60 * 1000);
          const gcal = new URL("https://calendar.google.com/calendar/render");
          gcal.searchParams.set("action", "TEMPLATE");
          gcal.searchParams.set("text", `Interview with ${iv.recruiterName || "recruiter"}`);
          gcal.searchParams.set(
            "dates",
            `${start.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}/${end
              .toISOString()
              .replace(/[-:]/g, "")
              .replace(/\.\d{3}/, "")}`,
          );
          if (iv.meetingLink) gcal.searchParams.set("details", iv.meetingLink);

          return (
            <div
              key={iv._id}
              className="rounded-xl border border-border bg-card p-4 text-sm"
            >
              <p className="font-medium">
                {start.toLocaleString()}
                {iv.timezone ? ` (${iv.timezone})` : ""}
              </p>
              <p className="mt-1 text-xs text-muted">
                {iv.recruiterName || "Recruiter"} · {iv.status}
              </p>
              {iv.meetingLink && (
                <a
                  href={iv.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-accent hover:underline"
                >
                  Meeting link
                </a>
              )}
              <div className="mt-3">
                <a
                  href={gcal.toString()}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  Add to Google Calendar
                </a>
              </div>
            </div>
          );
        })}
        {!items.length && !q.isLoading && (
          <p className="text-sm text-muted">No interviews scheduled yet.</p>
        )}
      </div>
    </div>
  );
}
