"use client";

import { JobsListPage } from "@/components/dashboard/jobs-list-page";

export default function DraftJobsPage() {
  return <JobsListPage filter="draft" />;
}
