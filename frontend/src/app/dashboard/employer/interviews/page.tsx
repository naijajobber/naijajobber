"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createInterview,
  listEmployerInterviews,
  updateInterview,
} from "@/lib/employer-api";
import { getMyJobs } from "@/lib/jobs-api";
import { listCompanyApplications as listApps } from "@/lib/employer-api";

export default function EmployerInterviewsPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["employer-interviews"],
    queryFn: listEmployerInterviews,
  });
  const jobsQ = useQuery({ queryKey: ["my-jobs"], queryFn: getMyJobs });
  const appsQ = useQuery({ queryKey: ["company-apps"], queryFn: listApps });
  const items = (q.data?.data as Array<{
    _id: string;
    scheduledAt: string;
    timezone?: string;
    meetingLink?: string;
    recruiterName?: string;
    status: string;
    interviewType?: string;
    panelists?: string[];
    jobId?: string;
    notes?: string;
  }> | undefined) || [];

  const [form, setForm] = useState({
    jobId: "",
    applicationId: "",
    scheduledAt: "",
    interviewType: "TECHNICAL",
    meetingLink: "",
    recruiterName: "",
    panelists: "",
    notes: "",
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Interview scheduling
        </h1>
        <p className="mt-1 text-sm text-muted">
          Company calendar — schedule online, phone, panel, and technical interviews.
        </p>
      </div>

      <section className="space-y-2 rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Schedule interview</h2>
        <select
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={form.jobId}
          onChange={(e) => setForm({ ...form, jobId: e.target.value })}
        >
          <option value="">Select job</option>
          {(jobsQ.data?.data || []).map((j) => (
            <option key={j._id} value={j._id}>
              {j.title}
            </option>
          ))}
        </select>
        <select
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={form.applicationId}
          onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
        >
          <option value="">Select application</option>
          {((appsQ.data?.data as Array<{ _id: string; jobId: string }> | undefined) || [])
            .filter((a) => !form.jobId || a.jobId === form.jobId)
            .map((a) => (
              <option key={a._id} value={a._id}>
                {a._id}
              </option>
            ))}
        </select>
        <Input
          type="datetime-local"
          value={form.scheduledAt}
          onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
        />
        <select
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={form.interviewType}
          onChange={(e) => setForm({ ...form, interviewType: e.target.value })}
        >
          {["PHONE_SCREEN", "TECHNICAL", "BEHAVIORAL", "PANEL", "FINAL", "OTHER"].map(
            (t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ),
          )}
        </select>
        <Input
          placeholder="Meeting link"
          value={form.meetingLink}
          onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
        />
        <Input
          placeholder="Recruiter name"
          value={form.recruiterName}
          onChange={(e) => setForm({ ...form, recruiterName: e.target.value })}
        />
        <Input
          placeholder="Panelists (comma-separated)"
          value={form.panelists}
          onChange={(e) => setForm({ ...form, panelists: e.target.value })}
        />
        <Button
          onClick={async () => {
            await createInterview({
              jobId: form.jobId,
              applicationId: form.applicationId || undefined,
              scheduledAt: new Date(form.scheduledAt).toISOString(),
              interviewType: form.interviewType,
              meetingLink: form.meetingLink,
              recruiterName: form.recruiterName,
              panelists: form.panelists
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              notes: form.notes,
            });
            await qc.invalidateQueries({ queryKey: ["employer-interviews"] });
          }}
        >
          Create
        </Button>
      </section>

      <div className="space-y-3">
        {items.map((iv) => {
          const start = new Date(iv.scheduledAt);
          const end = new Date(start.getTime() + 60 * 60 * 1000);
          const gcal = new URL("https://calendar.google.com/calendar/render");
          gcal.searchParams.set("action", "TEMPLATE");
          gcal.searchParams.set(
            "text",
            `Interview (${iv.interviewType || "Interview"})`,
          );
          gcal.searchParams.set(
            "dates",
            `${start.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}/${end
              .toISOString()
              .replace(/[-:]/g, "")
              .replace(/\.\d{3}/, "")}`,
          );
          const outlook = new URL(
            "https://outlook.live.com/calendar/0/deeplink/compose",
          );
          outlook.searchParams.set("subject", "Interview");
          outlook.searchParams.set("startdt", start.toISOString());
          outlook.searchParams.set("enddt", end.toISOString());

          return (
            <div
              key={iv._id}
              className="rounded-xl border border-border bg-card p-4 text-sm"
            >
              <p className="font-medium">{start.toLocaleString()}</p>
              <p className="text-xs text-muted">
                {iv.interviewType || "Interview"} · {iv.status} ·{" "}
                {iv.recruiterName || "Recruiter"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={gcal.toString()}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  Google Calendar
                </a>
                <a
                  href={outlook.toString()}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  Outlook
                </a>
                {iv.status === "SCHEDULED" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await updateInterview(iv._id, { status: "CANCELLED" });
                      await qc.invalidateQueries({
                        queryKey: ["employer-interviews"],
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {!items.length && (
          <p className="text-sm text-muted">No interviews scheduled.</p>
        )}
      </div>
    </div>
  );
}
