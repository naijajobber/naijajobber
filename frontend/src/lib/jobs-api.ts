import api, { ApiEnvelope } from "./api";

export type Job = {
  _id: string;
  id?: string;
  companyId: string;
  title: string;
  slug: string;
  description: string;
  employmentType: string;
  workplaceType: string;
  location: string;
  timezone: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  experienceLevel: string;
  skills: string[];
  category: string;
  status: string;
  isFeatured: boolean;
  isUrgent: boolean;
  easyApply: boolean;
  externalApplyUrl?: string;
  publishedAt?: string;
  createdAt?: string;
  department?: string;
  country?: string;
  openings?: number;
  preferredSkills?: string[];
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
  hiringProcess?: string;
  deadline?: string | null;
  screeningQuestions?: Array<{ id: string; prompt: string; type: string }>;
  tags?: string[];
  scheduledPublishAt?: string | null;
  paused?: boolean;
  archived?: boolean;
  featuredUntil?: string | null;
  sponsorBudget?: number;
  views?: number;
  bookmarks?: number;
  shares?: number;
  impressions?: number;
  clicks?: number;
  applicationCount?: number;
};

export type Application = {
  _id: string;
  jobId: string;
  applicantUserId: string;
  coverLetter: string;
  resumeUrl: string;
  status: string;
  timeline: Array<{ status: string; note: string; at: string }>;
  createdAt?: string;
  employerNotes?: string;
  expectedSalary?: string;
  seeker?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    location?: string;
    skills?: string[];
    experience?: unknown[];
    education?: unknown[];
    availabilityStatus?: string;
  };
  job?: {
    _id: string;
    title: string;
    slug: string;
    status: string;
    location?: string;
    companyId?: string;
  } | null;
};

export type Company = {
  _id: string;
  name: string;
  slug: string;
  website: string;
  logoUrl: string;
  description: string;
  size: string;
  industry: string;
  verificationStatus: string;
  coverBannerUrl?: string;
  email?: string;
  phone?: string;
  headquarters?: string;
  officeLocations?: string[];
  yearFounded?: number | null;
  mission?: string;
  vision?: string;
  coreValues?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  culturePhotos?: string[];
  officeImages?: string[];
  videoUrls?: string[];
  branding?: {
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  rejectionReason?: string;
  verificationDocuments?: Array<{
    type: string;
    fileUrl: string;
    uploadedAt?: string;
  }>;
  careerPage?: {
    story?: string;
    benefits?: string[];
    cultureBlurb?: string;
    seoTitle?: string;
    seoDescription?: string;
  };
  integrations?: Record<string, boolean>;
  apiKeys?: Array<{
    _id?: string;
    label?: string;
    createdAt?: string;
    revokedAt?: string | null;
  }>;
  webhooks?: Array<{ url: string; events: string[]; createdAt?: string }>;
};

export type Employer = {
  _id: string;
  userId: string;
  companyId: string | null;
  title: string;
};

export async function searchJobs(params: Record<string, string | number | boolean | undefined>) {
  const { data } = await api.get<ApiEnvelope<Job[]>>("/jobs", { params });
  return data;
}

export async function getJobBySlug(slug: string) {
  const { data } = await api.get<ApiEnvelope<Job>>(`/jobs/slug/${slug}`);
  return data;
}

export async function getMyJobs() {
  const { data } = await api.get<ApiEnvelope<Job[]>>("/jobs/mine");
  return data;
}

export async function createJob(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiEnvelope<Job>>("/jobs", payload);
  return data;
}

export async function updateJob(id: string, payload: Record<string, unknown>) {
  const { data } = await api.patch<ApiEnvelope<Job>>(`/jobs/${id}`, payload);
  return data;
}

export async function deleteJob(id: string) {
  const { data } = await api.delete<ApiEnvelope<{ message: string }>>(
    `/jobs/${id}`,
  );
  return data;
}

export async function publishJob(id: string) {
  const { data } = await api.post<ApiEnvelope<Job>>(`/jobs/${id}/publish`);
  return data;
}

export async function closeJob(id: string) {
  const { data } = await api.post<ApiEnvelope<Job>>(`/jobs/${id}/close`);
  return data;
}

export async function getCompanyBySlug(slug: string) {
  const { data } = await api.get<ApiEnvelope<Company>>(`/companies/slug/${slug}`);
  return data;
}

export async function getMyCompany() {
  const { data } = await api.get<ApiEnvelope<Company | null>>("/companies/mine");
  return data;
}

export async function createCompany(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiEnvelope<Company>>("/companies", payload);
  return data;
}

export async function updateCompany(id: string, payload: Record<string, unknown>) {
  const { data } = await api.patch<ApiEnvelope<Company>>(`/companies/${id}`, payload);
  return data;
}

export async function getEmployerMe() {
  const { data } = await api.get<ApiEnvelope<Employer>>("/employers/me");
  return data;
}

export async function applyToJob(payload: {
  jobId: string;
  coverLetter?: string;
  resumeUrl?: string;
}) {
  const { data } = await api.post<ApiEnvelope<Application>>("/applications", payload);
  return data;
}

export async function getMyApplications() {
  const { data } = await api.get<ApiEnvelope<Application[]>>("/applications/mine");
  return data;
}

export async function withdrawApplication(id: string) {
  const { data } = await api.post<ApiEnvelope<Application>>(
    `/applications/${id}/withdraw`,
  );
  return data;
}

export async function getJobApplications(jobId: string) {
  const { data } = await api.get<ApiEnvelope<Application[]>>(
    `/jobs/${jobId}/applications`,
  );
  return data;
}

export async function updateApplicationStatus(
  id: string,
  payload: { status: string; note?: string },
) {
  const { data } = await api.patch<ApiEnvelope<Application>>(
    `/applications/${id}/status`,
    payload,
  );
  return data;
}
