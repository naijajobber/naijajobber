import api, { ApiEnvelope } from "./api";

export type ResumeReviewResult = {
  runId: string;
  strengths?: string[];
  gaps?: string[];
  rewriteTips?: string[];
  score?: number;
  model?: string;
};

export type CoverLetterResult = {
  runId: string;
  letter: string;
  model?: string;
};

export type JobMatchResult = {
  runId: string;
  matches: Array<{
    jobId: string;
    title: string;
    slug?: string;
    score: number;
    reason: string;
  }>;
  model?: string;
};

export async function reviewResume(payload: {
  resumeText?: string;
  resumeUrl?: string;
}) {
  const { data } = await api.post<ApiEnvelope<ResumeReviewResult>>(
    "/ai/resume/review",
    payload,
  );
  return data;
}

export async function generateCoverLetter(payload: {
  jobId?: string;
  jobDescription?: string;
  resumeText?: string;
}) {
  const { data } = await api.post<ApiEnvelope<CoverLetterResult>>(
    "/ai/cover-letter",
    payload,
  );
  return data;
}

export async function matchJobs(payload?: { profileText?: string; limit?: number }) {
  const { data } = await api.post<ApiEnvelope<JobMatchResult>>(
    "/ai/match",
    payload || {},
  );
  return data;
}

export async function parseResume(payload: {
  resumeText?: string;
  resumeUrl?: string;
  fileName?: string;
}) {
  const { data } = await api.post("/ai/resume/parse", payload);
  return data;
}

export async function listAiRuns() {
  const { data } = await api.get<ApiEnvelope<unknown[]>>("/ai/runs");
  return data;
}
