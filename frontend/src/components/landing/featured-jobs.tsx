"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchJobs, type Job } from "@/lib/jobs-api";

const fallbackJobs: Job[] = [
  {
    _id: "1",
    companyId: "",
    title: "Community Moderator",
    slug: "community-moderator",
    description: "",
    employmentType: "PART_TIME",
    workplaceType: "REMOTE",
    location: "Africa",
    timezone: "WAT",
    salaryMin: 100,
    salaryMax: 300,
    salaryCurrency: "USD",
    experienceLevel: "ENTRY",
    skills: ["Discord", "Telegram"],
    category: "Community & Mods",
    status: "PUBLISHED",
    isFeatured: true,
    isUrgent: false,
    easyApply: true,
  },
  {
    _id: "2",
    companyId: "",
    title: "Web3 Ambassador",
    slug: "web3-ambassador",
    description: "",
    employmentType: "CONTRACT",
    workplaceType: "REMOTE",
    location: "Worldwide",
    timezone: "UTC",
    salaryMin: 200,
    salaryMax: 500,
    salaryCurrency: "USD",
    experienceLevel: "ENTRY",
    skills: ["Web3", "Content"],
    category: "Web3 & Crypto",
    status: "PUBLISHED",
    isFeatured: true,
    isUrgent: false,
    easyApply: true,
  },
  {
    _id: "3",
    companyId: "",
    title: "Backend Engineer (NestJS)",
    slug: "backend-engineer-nestjs",
    description: "",
    employmentType: "FULL_TIME",
    workplaceType: "REMOTE",
    location: "Lagos / Remote",
    timezone: "WAT",
    salaryMin: 65000,
    salaryMax: 95000,
    salaryCurrency: "USD",
    experienceLevel: "MID",
    skills: ["NestJS", "MongoDB"],
    category: "Software & Tech",
    status: "PUBLISHED",
    isFeatured: true,
    isUrgent: false,
    easyApply: true,
  },
  {
    _id: "4",
    companyId: "",
    title: "Local Delivery Coordinator",
    slug: "local-delivery-coordinator",
    description: "",
    employmentType: "FULL_TIME",
    workplaceType: "ONSITE",
    location: "Lagos",
    timezone: "WAT",
    salaryMin: 150000,
    salaryMax: 250000,
    salaryCurrency: "NGN",
    experienceLevel: "ENTRY",
    skills: ["Ops", "Logistics"],
    category: "Local Gigs",
    status: "PUBLISHED",
    isFeatured: true,
    isUrgent: false,
    easyApply: true,
  },
];

function salary(job: Job) {
  if (job.salaryMin == null) return "Competitive";
  return `${job.salaryCurrency} ${job.salaryMin.toLocaleString()}–${(job.salaryMax ?? job.salaryMin).toLocaleString()}`;
}

export function FeaturedJobs() {
  const { data } = useQuery({
    queryKey: ["featured-jobs"],
    queryFn: () => searchJobs({ isFeatured: true, limit: 4, page: 1 }),
    retry: false,
  });

  const jobs = data?.data?.length ? data.data : fallbackJobs;

  return (
    <section id="jobs" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
              Featured opportunities
            </h2>
            <p className="mt-2 text-muted">
              Verified local, remote, and Web3 openings from the community.
            </p>
          </div>
          <Link href="/jobs" className="text-sm font-medium text-accent hover:underline">
            View all
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job, i) => (
            <motion.article
              key={job._id || job.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-border bg-card p-5 transition hover:border-accent/40"
            >
              <Link href={`/jobs/${job.slug}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <p className="text-sm text-muted">{job.category}</p>
                  </div>
                  <span className="rounded-md bg-surface px-2 py-1 text-xs text-accent">
                    {job.employmentType.replaceAll("_", " ")}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} /> {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} /> Recently posted
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    {job.skills?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-border px-2 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium">{salary(job)}</span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
