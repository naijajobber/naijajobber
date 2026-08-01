import api, { ApiEnvelope } from "./api";

export type Conversation = {
  _id: string;
  participantIds: string[];
  jobId?: string;
  applicationId?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
};

export type ChatMessage = {
  _id: string;
  conversationId: string;
  senderId: string;
  body: string;
  attachments: Array<{ url: string; mime: string; name: string }>;
  readBy: string[];
  createdAt?: string;
};

export async function openConversation(applicationId: string) {
  const { data } = await api.post<ApiEnvelope<Conversation>>("/conversations", {
    applicationId,
  });
  return data;
}

export async function listConversations() {
  const { data } = await api.get<ApiEnvelope<Conversation[]>>("/conversations");
  return data;
}

export async function listMessages(conversationId: string, page = 1) {
  const { data } = await api.get<ApiEnvelope<ChatMessage[]>>(
    `/conversations/${conversationId}/messages`,
    { params: { page, limit: 50 } },
  );
  return data;
}

export async function sendMessage(
  conversationId: string,
  payload: { body?: string; attachments?: Array<{ url: string; name?: string }> },
) {
  const { data } = await api.post<ApiEnvelope<ChatMessage>>(
    `/conversations/${conversationId}/messages`,
    payload,
  );
  return data;
}
