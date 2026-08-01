import api, { ApiEnvelope } from "./api";

export type CompanyBranding = {
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
};

export type CompanySocialLinks = {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
};

export type VerificationDocument = {
  type: string;
  fileUrl: string;
  uploadedAt?: string;
};

export type CareerPageContent = {
  story?: string;
  benefits?: string[];
  cultureBlurb?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type EmployerOverview = {
  company?: {
    name?: string;
    slug?: string;
    verificationStatus?: string;
    rejectionReason?: string;
  } | null;
  jobCounts?: {
    draft?: number;
    published?: number;
    closed?: number;
    featured?: number;
    paused?: number;
    archived?: number;
    total?: number;
  };
  applicantsTotal?: number;
  applicantsToday?: number;
  interviewsScheduled?: number;
  hires?: number;
  unreadNotifications?: number;
  subscription?: {
    planCode?: string;
    status?: string;
    currentPeriodEnd?: string;
  } | null;
  funnel?: Record<string, number>;
  recentActivities?: Array<{ type: string; title: string; at: string }>;
  upcomingInterviews?: Array<{
    id: string;
    scheduledAt: string;
    recruiterName?: string;
    jobId?: string;
  }>;
};

export async function getEmployerOverview() {
  const { data } = await api.get<ApiEnvelope<EmployerOverview>>(
    "/employers/me/overview",
  );
  return data;
}

export async function uploadVerificationDocument(file: File, type: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("type", type);
  const { data } = await api.post(
    "/companies/mine/verification/documents",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function resubmitVerification() {
  const { data } = await api.post("/companies/mine/verification/resubmit");
  return data;
}

export async function getEmployerAnalytics() {
  const { data } = await api.get("/employers/me/analytics");
  return data;
}

export async function listTeamMembers() {
  const { data } = await api.get("/employers/team");
  return data;
}

export async function inviteTeamMember(payload: {
  email: string;
  companyRole: string;
  title?: string;
}) {
  const { data } = await api.post("/employers/team/invite", payload);
  return data;
}

export async function updateTeamMemberRole(
  memberId: string,
  companyRole: string,
) {
  const { data } = await api.patch(`/employers/team/${memberId}/role`, {
    companyRole,
  });
  return data;
}

export async function deactivateTeamMember(memberId: string) {
  const { data } = await api.post(`/employers/team/${memberId}/deactivate`);
  return data;
}

export async function removeTeamMember(memberId: string) {
  const { data } = await api.delete(`/employers/team/${memberId}`);
  return data;
}

export async function listTalentPool(params?: Record<string, string>) {
  const { data } = await api.get("/talent-pool", { params });
  return data;
}

export async function addTalentCandidate(payload: Record<string, unknown>) {
  const { data } = await api.post("/talent-pool", payload);
  return data;
}

export async function updateTalentCandidate(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data } = await api.patch(`/talent-pool/${id}`, payload);
  return data;
}

export async function removeTalentCandidate(id: string) {
  const { data } = await api.delete(`/talent-pool/${id}`);
  return data;
}

export async function listAssessments() {
  const { data } = await api.get("/assessments");
  return data;
}

export async function createAssessment(payload: Record<string, unknown>) {
  const { data } = await api.post("/assessments", payload);
  return data;
}

export async function sendAssessment(id: string, applicationId: string) {
  const { data } = await api.post(`/assessments/${id}/send`, { applicationId });
  return data;
}

export async function listOffers() {
  const { data } = await api.get("/offers");
  return data;
}

export async function createOffer(payload: Record<string, unknown>) {
  const { data } = await api.post("/offers", payload);
  return data;
}

export async function listCompanyApplications() {
  const { data } = await api.get("/applications/company");
  return data;
}

export async function bulkUpdateApplicationStatus(payload: {
  ids: string[];
  status: string;
  note?: string;
}) {
  const { data } = await api.post("/applications/bulk-status", payload);
  return data;
}

export async function listEmployerInterviews() {
  const { data } = await api.get("/interviews/employer");
  return data;
}

export async function createInterview(payload: Record<string, unknown>) {
  const { data } = await api.post("/interviews", payload);
  return data;
}

export async function updateInterview(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data } = await api.patch(`/interviews/${id}`, payload);
  return data;
}

export async function matchCandidates(jobId: string) {
  const { data } = await api.post("/ai/candidates/match", { jobId });
  return data;
}

export async function duplicateJob(id: string) {
  const { data } = await api.post(`/jobs/${id}/duplicate`);
  return data;
}

export async function archiveJob(id: string) {
  const { data } = await api.post(`/jobs/${id}/archive`);
  return data;
}

export async function pauseJob(id: string) {
  const { data } = await api.post(`/jobs/${id}/pause`);
  return data;
}

export async function unpauseJob(id: string) {
  const { data } = await api.post(`/jobs/${id}/unpause`);
  return data;
}

export async function listSupportTickets() {
  const { data } = await api.get("/support/tickets");
  return data;
}

export async function createSupportTicket(payload: Record<string, unknown>) {
  const { data } = await api.post("/support/tickets", payload);
  return data;
}

export async function generateApiKey(label: string) {
  const { data } = await api.post("/companies/mine/api-keys", { label });
  return data;
}

export async function revokeApiKey(keyId: string) {
  const { data } = await api.post(`/companies/mine/api-keys/${keyId}/revoke`);
  return data;
}

export async function registerWebhook(payload: {
  url: string;
  events: string[];
}) {
  const { data } = await api.post("/companies/mine/webhooks", payload);
  return data;
}

export async function updateIntegrations(
  payload: Record<string, boolean>,
) {
  const { data } = await api.patch("/companies/mine/integrations", payload);
  return data;
}
