import api, { ApiEnvelope } from "./api";

export type NotificationItem = {
  _id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  readAt: string | null;
  createdAt?: string;
};

export type NotificationPrefs = {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
};

export async function listNotifications() {
  const { data } = await api.get<ApiEnvelope<NotificationItem[]>>("/notifications");
  return data;
}

export async function unreadNotificationCount() {
  const { data } = await api.get<ApiEnvelope<{ count: number }>>(
    "/notifications/unread-count",
  );
  return data;
}

export async function markNotificationRead(id: string) {
  const { data } = await api.patch<ApiEnvelope<NotificationItem>>(
    `/notifications/${id}/read`,
  );
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.post<ApiEnvelope<{ modified: number }>>(
    "/notifications/read-all",
  );
  return data;
}

export async function getNotificationPreferences() {
  const { data } = await api.get<ApiEnvelope<NotificationPrefs>>(
    "/notifications/preferences",
  );
  return data;
}

export async function updateNotificationPreferences(
  payload: Partial<NotificationPrefs>,
) {
  const { data } = await api.patch<ApiEnvelope<NotificationPrefs>>(
    "/notifications/preferences",
    payload,
  );
  return data;
}
