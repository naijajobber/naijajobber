import api, { ApiEnvelope } from "./api";

export type AdminOverview = {
  users: number;
  employers?: number;
  companies: {
    pending: number;
    verified: number;
    rejected: number;
    requestInfo?: number;
  };
  jobs: { draft: number; published: number; closed: number };
  applicationsLast7Days: number;
  revenue: Array<{ _id: string; total: number }>;
  interviewsScheduled?: number;
  hires?: number;
  activeSubscriptions?: number;
  monthlyRevenue?: Array<{ _id: string; total: number }>;
  openSupportTickets?: number;
  aiRunsToday?: number;
  dau?: number;
  mau?: number;
  recentActivities?: AdminAuditItem[];
  monthlyTrends?: Array<{
    month: string;
    users: number;
    jobs: number;
    applications: number;
  }>;
};

export type AdminUser = {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  lastLoginAt?: string;
  phone?: string;
  country?: string;
  createdAt?: string;
};

export type AdminCompany = {
  _id: string;
  name: string;
  slug: string;
  verificationStatus: string;
  industry?: string;
  website?: string;
  verificationDocuments?: Array<{
    type: string;
    fileUrl: string;
    uploadedAt?: string;
  }>;
  verificationNotes?: Array<{
    note: string;
    byUserId?: string;
    at?: string;
  }>;
  assignedModeratorUserId?: string | null;
  rejectionReason?: string;
};

export type AdminJob = {
  _id: string;
  title: string;
  status: string;
  slug?: string;
  category?: string;
  flagged?: boolean;
  paused?: boolean;
  archived?: boolean;
  isFeatured?: boolean;
  isSponsored?: boolean;
  companyId?: string;
};

export type AdminApplication = {
  _id: string;
  jobId: string;
  applicantUserId: string;
  status: string;
  createdAt?: string;
  coverLetter?: string;
};

export type AdminTransaction = {
  _id: string;
  reference: string;
  amount: number;
  currency?: string;
  status: string;
  purpose?: string;
  createdAt?: string;
};

export type AdminRefund = {
  _id: string;
  status: string;
  amount?: number;
  currency?: string;
  reason?: string;
  transactionId?: string;
};

export type AdminAuditItem = {
  _id: string;
  action: string;
  targetType: string;
  targetId: string;
  actorUserId?: string;
  actorId?: string;
  meta?: Record<string, unknown>;
  createdAt?: string;
};

export type AdminEmployer = {
  _id: string;
  userId: string;
  companyId: string | null;
  title: string;
  isPrimary?: boolean;
  isActive?: boolean;
  jobsPosted?: number;
  verificationStatus?: string | null;
  companyName?: string | null;
  planCode?: string | null;
};

export type AdminPlan = {
  _id?: string;
  code: string;
  name: string;
  price: number;
  currency?: string;
  interval?: string;
  features?: string[];
  isActive?: boolean;
};

export type AdminCoupon = {
  _id: string;
  code: string;
  percentOff?: number | null;
  amountOff?: number | null;
  expiresAt?: string | null;
  maxRedemptions?: number;
  redemptionCount?: number;
  isActive?: boolean;
};

export type AdminTicket = {
  _id: string;
  subject: string;
  category?: string;
  body?: string;
  status: string;
  userId?: string;
  assignedAgentId?: string | null;
  notes?: Array<{ note: string; at?: string }>;
  createdAt?: string;
};

export type AdminCmsPage = {
  _id: string;
  slug: string;
  title: string;
  bodyHtml?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: string;
};

export type AdminBlogPost = {
  _id: string;
  slug: string;
  title: string;
  bodyMarkdown?: string;
  excerpt?: string;
  status: string;
  scheduledAt?: string | null;
  publishedAt?: string | null;
};

export type AdminLearningItem = {
  _id: string;
  title: string;
  type: string;
  body: string;
  tags?: string[];
};

export type AdminSettings = {
  platformName?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  maintenanceMode?: boolean;
  featureFlags?: Record<string, boolean>;
  localization?: Record<string, string>;
  security?: Record<string, number>;
  blockedIps?: string[];
  aiPrompts?: Record<string, string>;
  apiKeys?: Array<{
    id: string;
    name: string;
    keyPrefix: string;
    createdAt?: string;
    revokedAt?: string | null;
  }>;
  envConfigured?: Record<string, unknown>;
};

export async function getAdminOverview() {
  const { data } = await api.get<ApiEnvelope<AdminOverview>>("/admin/overview");
  return data;
}

export async function adminSearch(q: string) {
  const { data } = await api.get("/admin/search", { params: { q } });
  return data;
}

export async function listAdminCompanies(params?: {
  status?: string;
  page?: number;
  q?: string;
  limit?: number;
}) {
  const { data } = await api.get<ApiEnvelope<AdminCompany[]>>("/admin/companies", {
    params,
  });
  return data;
}

export async function verifyAdminCompany(id: string) {
  const { data } = await api.post(`/admin/companies/${id}/verify`);
  return data;
}

export async function rejectAdminCompany(id: string, reason?: string) {
  const { data } = await api.post(`/admin/companies/${id}/reject`, { reason });
  return data;
}

export async function requestAdminCompanyInfo(id: string, note: string) {
  const { data } = await api.post(`/admin/companies/${id}/request-info`, {
    note,
  });
  return data;
}

export async function assignAdminCompanyModerator(
  id: string,
  moderatorUserId: string,
) {
  const { data } = await api.post(`/admin/companies/${id}/assign-moderator`, {
    moderatorUserId,
  });
  return data;
}

export async function listAdminUsers(params?: {
  q?: string;
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  country?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const { data } = await api.get<ApiEnvelope<AdminUser[]>>("/admin/users", {
    params,
  });
  return data;
}

export async function updateAdminUserRole(id: string, role: string) {
  const { data } = await api.patch<ApiEnvelope<AdminUser>>(
    `/admin/users/${id}/role`,
    { role },
  );
  return data;
}

export async function deleteAdminUser(id: string) {
  const { data } = await api.delete<ApiEnvelope<{ message?: string }>>(
    `/admin/users/${id}`,
  );
  return data;
}

export async function suspendAdminUser(id: string) {
  const { data } = await api.post(`/admin/users/${id}/suspend`);
  return data;
}

export async function reactivateAdminUser(id: string) {
  const { data } = await api.post(`/admin/users/${id}/reactivate`);
  return data;
}

export async function verifyAdminUserEmail(id: string) {
  const { data } = await api.post(`/admin/users/${id}/verify-email`);
  return data;
}

export async function resetAdminUserPassword(id: string) {
  const { data } = await api.post(`/admin/users/${id}/reset-password`);
  return data;
}

export async function listAdminJobs(params?: {
  q?: string;
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  companyId?: string;
}) {
  const { data } = await api.get<ApiEnvelope<AdminJob[]>>("/admin/jobs", {
    params,
  });
  return data;
}

export async function unpublishAdminJob(id: string) {
  const { data } = await api.post(`/admin/jobs/${id}/unpublish`);
  return data;
}

export async function approvePublishAdminJob(id: string) {
  const { data } = await api.post(`/admin/jobs/${id}/approve-publish`);
  return data;
}

export async function flagAdminJob(id: string, reason?: string) {
  const { data } = await api.post(`/admin/jobs/${id}/flag`, { reason });
  return data;
}

export async function featureAdminJob(id: string, featured = true) {
  const { data } = await api.post(`/admin/jobs/${id}/feature`, { featured });
  return data;
}

export async function sponsorAdminJob(id: string, sponsored = true) {
  const { data } = await api.post(`/admin/jobs/${id}/sponsor`, { sponsored });
  return data;
}

export async function pauseAdminJob(id: string, paused = true) {
  const { data } = await api.post(`/admin/jobs/${id}/pause`, { paused });
  return data;
}

export async function closeAdminJob(id: string) {
  const { data } = await api.post(`/admin/jobs/${id}/close`);
  return data;
}

export async function archiveAdminJob(id: string) {
  const { data } = await api.post(`/admin/jobs/${id}/archive`);
  return data;
}

export async function duplicateAdminJob(id: string) {
  const { data } = await api.post(`/admin/jobs/${id}/duplicate`);
  return data;
}

export async function deleteAdminJob(id: string) {
  const { data } = await api.delete(`/admin/jobs/${id}`);
  return data;
}

export async function listJobApplicants(
  id: string,
  params?: { page?: number; limit?: number; status?: string },
) {
  const { data } = await api.get(`/admin/jobs/${id}/applicants`, { params });
  return data;
}

export async function listAdminApplications(params?: {
  page?: number;
  limit?: number;
  status?: string;
  companyId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const { data } = await api.get<ApiEnvelope<AdminApplication[]>>(
    "/admin/applications",
    { params },
  );
  return data;
}

export async function listAdminTransactions(params?: {
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get<ApiEnvelope<AdminTransaction[]>>(
    "/admin/billing/transactions",
    { params },
  );
  return data;
}

export async function retryMarkAdminTransaction(id: string) {
  const { data } = await api.post(`/admin/billing/transactions/${id}/retry-mark`);
  return data;
}

export async function listAdminRefunds(params?: {
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get<ApiEnvelope<AdminRefund[]>>(
    "/admin/billing/refunds",
    { params },
  );
  return data;
}

export async function reviewAdminRefund(
  id: string,
  status: "APPROVED" | "REJECTED",
) {
  const { data } = await api.patch(`/admin/billing/refunds/${id}`, { status });
  return data;
}

export async function listAdminPlans() {
  const { data } = await api.get<ApiEnvelope<AdminPlan[]>>("/admin/billing/plans");
  return data;
}

export async function upsertAdminPlan(plan: AdminPlan) {
  const { data } = await api.put("/admin/billing/plans", plan);
  return data;
}

export async function listAdminCoupons() {
  const { data } = await api.get<ApiEnvelope<AdminCoupon[]>>(
    "/admin/billing/coupons",
  );
  return data;
}

export async function createAdminCoupon(body: {
  code: string;
  percentOff?: number;
  amountOff?: number;
  maxRedemptions?: number;
}) {
  const { data } = await api.post("/admin/billing/coupons", body);
  return data;
}

export async function getAdminRevenueAnalytics() {
  const { data } = await api.get("/admin/revenue/analytics");
  return data;
}

export async function listAdminAudit(params?: {
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get<ApiEnvelope<AdminAuditItem[]>>("/admin/audit", {
    params,
  });
  return data;
}

export async function listAdminEmployers(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const { data } = await api.get<ApiEnvelope<AdminEmployer[]>>(
    "/admin/employers",
    { params },
  );
  return data;
}

export async function deactivateAdminEmployer(id: string) {
  const { data } = await api.post(`/admin/employers/${id}/deactivate`);
  return data;
}

export async function getAdminRbacMatrix() {
  const { data } = await api.get("/admin/rbac/matrix");
  return data;
}

export async function listAdminTickets(params?: {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
}) {
  const { data } = await api.get<ApiEnvelope<AdminTicket[]>>(
    "/admin/support/tickets",
    { params },
  );
  return data;
}

export async function updateAdminTicket(
  id: string,
  body: { status?: string; assignedAgentId?: string; note?: string },
) {
  const { data } = await api.patch(`/admin/support/tickets/${id}`, body);
  return data;
}

export async function getAdminReferrals() {
  const { data } = await api.get("/admin/referrals");
  return data;
}

export async function broadcastAdminNotification(body: {
  audience: string;
  title: string;
  body: string;
  channels?: string[];
  scheduleAt?: string;
}) {
  const { data } = await api.post("/admin/notifications/broadcast", body);
  return data;
}

export async function listAdminCmsPages() {
  const { data } = await api.get<ApiEnvelope<AdminCmsPage[]>>("/admin/cms/pages");
  return data;
}

export async function createAdminCmsPage(body: Partial<AdminCmsPage>) {
  const { data } = await api.post("/admin/cms/pages", body);
  return data;
}

export async function updateAdminCmsPage(id: string, body: Partial<AdminCmsPage>) {
  const { data } = await api.patch(`/admin/cms/pages/${id}`, body);
  return data;
}

export async function deleteAdminCmsPage(id: string) {
  const { data } = await api.delete(`/admin/cms/pages/${id}`);
  return data;
}

export async function listAdminBlogPosts() {
  const { data } = await api.get<ApiEnvelope<AdminBlogPost[]>>("/admin/cms/blog");
  return data;
}

export async function createAdminBlogPost(body: Partial<AdminBlogPost>) {
  const { data } = await api.post("/admin/cms/blog", body);
  return data;
}

export async function updateAdminBlogPost(
  id: string,
  body: Partial<AdminBlogPost>,
) {
  const { data } = await api.patch(`/admin/cms/blog/${id}`, body);
  return data;
}

export async function deleteAdminBlogPost(id: string) {
  const { data } = await api.delete(`/admin/cms/blog/${id}`);
  return data;
}

export async function listAdminLearning() {
  const { data } = await api.get<ApiEnvelope<AdminLearningItem[]>>(
    "/admin/learning",
  );
  return data;
}

export async function createAdminLearning(body: Partial<AdminLearningItem>) {
  const { data } = await api.post("/admin/learning", body);
  return data;
}

export async function updateAdminLearning(
  id: string,
  body: Partial<AdminLearningItem>,
) {
  const { data } = await api.patch(`/admin/learning/${id}`, body);
  return data;
}

export async function deleteAdminLearning(id: string) {
  const { data } = await api.delete(`/admin/learning/${id}`);
  return data;
}

export async function getAdminImpact() {
  const { data } = await api.get("/admin/impact");
  return data;
}

export async function getAdminReport(type: string, format: "json" | "csv" = "json") {
  const { data } = await api.get(`/admin/reports/${type}`, {
    params: { format },
  });
  return data;
}

export async function getAdminAiUsage() {
  const { data } = await api.get("/admin/ai/usage");
  return data;
}

export async function getAdminSettings() {
  const { data } = await api.get<ApiEnvelope<AdminSettings>>("/admin/settings");
  return data;
}

export async function patchAdminSettings(body: Partial<AdminSettings>) {
  const { data } = await api.patch("/admin/settings", body);
  return data;
}

export async function generateAdminApiKey(name: string) {
  const { data } = await api.post("/admin/api-keys", { name });
  return data;
}

export async function revokeAdminApiKey(id: string) {
  const { data } = await api.delete(`/admin/api-keys/${id}`);
  return data;
}

export async function getAdminFraudSignals() {
  const { data } = await api.get("/admin/fraud/signals");
  return data;
}

export type PlatformHealth = {
  status?: string;
  info?: Record<string, { status: string }>;
  error?: Record<string, { status: string }>;
  details?: Record<string, { status: string }>;
};

export async function getPlatformHealth(): Promise<PlatformHealth> {
  const { data } = await api.get<ApiEnvelope<PlatformHealth> | PlatformHealth>(
    "/health",
  );
  if (data && typeof data === "object" && "success" in data && "data" in data) {
    return (data as ApiEnvelope<PlatformHealth>).data ?? {};
  }
  return (data as PlatformHealth) ?? {};
}
