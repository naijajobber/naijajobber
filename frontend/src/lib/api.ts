import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("nj_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown> | null;
  message: string;
};

export async function registerUser(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: "JOB_SEEKER" | "EMPLOYER";
}) {
  const { data } = await api.post<ApiEnvelope<unknown>>("/auth/register", payload);
  return data;
}

export async function loginUser(payload: { email: string; password: string }) {
  const { data } = await api.post<
    ApiEnvelope<{
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
      };
      accessToken: string;
      refreshToken: string;
    }>
  >("/auth/login", payload);
  return data;
}

export async function verifyEmail(token: string) {
  const { data } = await api.post<ApiEnvelope<unknown>>("/auth/verify-email", {
    token,
  });
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await api.post<ApiEnvelope<unknown>>("/auth/forgot-password", {
    email,
  });
  return data;
}

export async function resetPassword(token: string, password: string) {
  const { data } = await api.post<ApiEnvelope<unknown>>("/auth/reset-password", {
    token,
    password,
  });
  return data;
}

export async function getMe() {
  const { data } = await api.get<ApiEnvelope<Record<string, unknown>>>("/users/me");
  return data;
}

export default api;
