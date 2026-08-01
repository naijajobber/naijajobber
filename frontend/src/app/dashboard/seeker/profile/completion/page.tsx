"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { computeProfileCompletion } from "@/components/dashboard/profile-completion";
import { getMe } from "@/lib/api";
import { getMyProfile } from "@/lib/profiles-api";

export default function ProfileCompletionPage() {
  const profileQ = useQuery({ queryKey: ["seeker-profile"], queryFn: getMyProfile });
  const meQ = useQuery({ queryKey: ["seeker-me"], queryFn: getMe });
  const me = meQ.data?.data || {};
  const profile = profileQ.data?.data;
  const { percent, checks, next, missing } = computeProfileCompletion({
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

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Profile Completion
      </h1>
      <div
        className="relative mx-auto mt-8 flex h-36 w-36 items-center justify-center rounded-full border-4 border-accent/30"
        style={{
          background: `conic-gradient(var(--accent) ${percent}%, var(--border) 0)`,
        }}
      >
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-card text-3xl font-bold">
          {percent}%
        </div>
      </div>
      {next && (
        <p className="mt-6 text-center text-sm text-muted">
          Next up:{" "}
          <Link
            href={checks.find((c) => !c.done)?.href || "/dashboard/seeker/profile"}
            className="text-accent hover:underline"
          >
            {next}
          </Link>
        </p>
      )}
      {missing.length === 0 && (
        <p className="mt-6 text-center text-sm text-accent">Profile looks complete.</p>
      )}
      <ul className="mt-8 space-y-2 text-sm">
        {checks.map((c) => (
          <li key={c.key}>
            <Link
              href={c.href}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 hover:border-accent/40"
            >
              <span>{c.label}</span>
              <span className={c.done ? "text-accent" : "text-muted"}>
                {c.done ? "Done" : "Missing"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
