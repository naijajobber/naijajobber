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
    title: "Senior Frontend Engineer",
    slug: "senior-frontend-engineer",
    description: "",
    employmentType: "FULL_TIME",
    workplaceType: "REMOTE",
    location: "Worldwide",
    timezone: "UTC",
    salaryMin: 70000,
    salaryMax: 110000,
    salaryCurrency: "USD",
    experienceLevel: "SENIOR",
    skills: ["React", "TypeScript"],
    category: "Software Engineering",
    status: "PUBLISHED",
    isFeatured: true,
    isUrgent: false,
    easyApply: true,
  },
  {
    _id: "2",
    companyId: "",
    title: "Backend Engineer (NestJS)",
    slug: "backend-engineer-nestjs",
    description: "",
    employmentType: "FULL_TIME",
    workplaceType: "REMOTE",
    location: "Africa",
    timezone: "UTC",
    salaryMin: 65000,
    salaryMax: 95000,
    salaryCurrency: "USD",
    experienceLevel: "MID",
    skills: ["NestJS", "MongoDB"],
    category: "Software Engineering",
    status: "PUBLISHED",
    isFeatured: true,
    isUrgent: false,
    easyApply: true,
  },
  {
    _id: "3",
    companyId: "",
    title: "Product Designer",
    slug: "product-designer",
    description: "",
    employmentType: "CONTRACT",
    workplaceType: "HYBRID",
    location: "Lagos",
    timezone: "WAT",
    salaryMin: 45,
    salaryMax: 75,
    salaryCurrency: "USD",
    experienceLevel: "MID",
    skills: ["Figma", "UX"],
    category: "Product & Design",
    status: "PUBLISHED",
    isFeatured: true,
    isUrgent: false,
    easyApply: true,
  },
  {
    _id: "4",
    companyId: "",
    title: "DevOps Engineer",
    slug: "devops-engineer",
    description: "",
    employmentType: "FULL_TIME",
    workplaceType: "REMOTE",
    location: "Worldwide",
    timezone: "UTC",
    salaryMin: 80000,
    salaryMax: 120000,
    salaryCurrency: "USD",
    experienceLevel: "SENIOR",
    skills: ["Docker", "AWS"],
    category: "Software Engineering",
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
              Featured remote jobs
            </h2>
            <p className="mt-2 text-muted">
              Curated openings from verified employers.
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
