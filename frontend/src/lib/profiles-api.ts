import api, { ApiEnvelope } from "./api";

export type CvFile = {
  url: string;
  name: string;
  mime: string;
  version?: number;
  isDefault?: boolean;
  uploadedAt?: string;
};

export type LanguageItem = {
  language?: string;
  speaking?: string;
  writing?: string;
  reading?: string;
  listening?: string;
};

export type CertificateItem = {
  name?: string;
  organization?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialUrl?: string;
  credentialId?: string;
  fileUrl?: string;
};

export type SkillItem = {
  name?: string;
  category?: string;
  level?: string;
};

export type CareerGoals = {
  desiredRole?: string;
  targetSalary?: string;
  preferredCountries?: string[];
  preferredCompanies?: string[];
  industries?: string[];
  careerObjectives?: string;
  learningGoals?: string;
};

export type SeekerProfile = {
  _id: string;
  userId: string;
  skills: string[];
  skillItems?: SkillItem[];
  experience: Array<{
    title?: string;
    company?: string;
    employmentType?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    currentlyWorking?: boolean;
    description?: string;
    achievements?: string;
    technologies?: string[];
  }>;
  education: Array<{
    school?: string;
    degree?: string;
    field?: string;
    grade?: string;
    year?: string;
    startDate?: string;
    endDate?: string;
    achievements?: string;
  }>;
  languages?: LanguageItem[];
  certificates?: CertificateItem[];
  portfolioLinks: string[];
  portfolioScreenshots?: string[];
  visibility: "PRIVATE" | "EMPLOYERS" | "PUBLIC";
  cvPdfUrl?: string;
  cvFiles?: CvFile[];
  employmentStatus?: string;
  yearsOfExperience?: number | null;
  preferredSalary?: string;
  preferredJobType?: string;
  preferredTimezone?: string;
  preferredCountry?: string;
  preferredIndustry?: string;
  currentJobTitle?: string;
  availabilityStatus?: string;
  careerGoals?: CareerGoals;
  learningBookmarks?: string[];
  profileViews?: number;
  resumeDownloads?: number;
  jobAlertPrefs?: {
    enabled: boolean;
    keywords: string[];
    frequency: string;
    country?: string;
    salaryMin?: string;
    workplaceTypes?: string[];
    industry?: string;
    category?: string;
    experience?: string;
  };
};

export async function getMyProfile() {
  const { data } = await api.get<ApiEnvelope<SeekerProfile>>("/profiles/me");
  return data;
}

export async function updateMyProfile(payload: Partial<SeekerProfile>) {
  const { data } = await api.patch<ApiEnvelope<SeekerProfile>>(
    "/profiles/me",
    payload,
  );
  return data;
}

export async function generateCvDocument(template?: string) {
  const { data } = await api.post<ApiEnvelope<SeekerProfile>>(
    "/profiles/me/cv/generate",
    { template },
  );
  return data;
}

/** @deprecated use generateCvDocument */
export async function generateCvPdf() {
  return generateCvDocument();
}

export async function uploadCvFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<ApiEnvelope<SeekerProfile>>(
    "/profiles/me/cv/upload",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function setPrimaryCv(url: string) {
  const { data } = await api.post<ApiEnvelope<SeekerProfile>>(
    "/profiles/me/cv/primary",
    { url },
  );
  return data;
}

export async function deleteCvFile(url: string) {
  const { data } = await api.delete<ApiEnvelope<SeekerProfile>>(
    "/profiles/me/cv",
    { data: { url } },
  );
  return data;
}

export async function replaceCvFile(url: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  form.append("url", url);
  const { data } = await api.post<ApiEnvelope<SeekerProfile>>(
    "/profiles/me/cv/replace",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function applyParsedResume(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiEnvelope<SeekerProfile>>(
    "/profiles/me/cv/parse-apply",
    payload,
  );
  return data;
}

export async function updateAlertPrefs(payload: {
  enabled?: boolean;
  keywords?: string[];
  frequency?: string;
  country?: string;
  salaryMin?: string;
  workplaceTypes?: string[];
  industry?: string;
  category?: string;
  experience?: string;
}) {
  const { data } = await api.patch("/profiles/me/alerts", payload);
  return data;
}

export async function updateSettings(payload: {
  firstName?: string;
  lastName?: string;
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  avatarUrl?: string;
  address?: string;
  country?: string;
  nationality?: string;
}) {
  const { data } = await api.patch("/settings/me", payload);
  return data;
}

export async function listSavedJobs() {
  const { data } = await api.get("/jobs/saved");
  return data;
}

export async function saveJob(jobId: string) {
  const { data } = await api.post(`/jobs/${jobId}/save`);
  return data;
}

export async function unsaveJob(jobId: string) {
  const { data } = await api.delete(`/jobs/${jobId}/save`);
  return data;
}

export async function getPublicProfile(userId: string) {
  const { data } = await api.get<ApiEnvelope<SeekerProfile>>(
    `/profiles/${userId}`,
  );
  return data;
}

export async function getMyInsights() {
  const { data } = await api.get("/profiles/me/insights");
  return data;
}
