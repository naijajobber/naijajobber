import api, { ApiEnvelope } from "./api";

export type Interview = {
  _id: string;
  jobId: string;
  applicationId?: string;
  scheduledAt: string;
  timezone?: string;
  meetingLink?: string;
  recruiterName?: string;
  status: string;
};

export async function listMyInterviews() {
  const { data } = await api.get<ApiEnvelope<Interview[]>>("/interviews/mine");
  return data;
}

export async function listLearningItems() {
  const { data } = await api.get("/learning/items");
  return data;
}

export async function toggleLearningBookmark(itemId: string) {
  const { data } = await api.post("/profiles/me/learning/bookmarks", { itemId });
  return data;
}

export async function getMyReferrals() {
  const { data } = await api.get("/referrals/me");
  return data;
}

export async function creditMockReferral() {
  const { data } = await api.post("/referrals/credit-mock");
  return data;
}
