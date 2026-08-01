"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
  setSession: (payload: {
    accessToken: string;
    refreshToken: string;
    user: AuthState["user"];
  }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: ({ accessToken, refreshToken, user }) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("nj_access_token", accessToken);
          localStorage.setItem("nj_refresh_token", refreshToken);
        }
        set({ accessToken, refreshToken, user });
      },
      clearSession: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("nj_access_token");
          localStorage.removeItem("nj_refresh_token");
        }
        set({ accessToken: null, refreshToken: null, user: null });
      },
    }),
    { name: "nj-auth" },
  ),
);
