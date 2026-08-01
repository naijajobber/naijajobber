"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getDashboardPath,
  isEmployerRole,
  isSeekerRole,
} from "@/lib/dashboard-path";
import { useAuthStore } from "@/store/auth-store";

export default function LegacyProfileRedirect() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  useEffect(() => {
    if (!role) {
      router.replace("/login?next=/dashboard/profile");
      return;
    }
    router.replace(
      isSeekerRole(role)
        ? "/dashboard/seeker/profile"
        : isEmployerRole(role)
          ? "/dashboard/employer/company"
          : getDashboardPath(role),
    );
  }, [router, role]);
  return <p className="p-8 text-sm text-muted">Redirecting…</p>;
}
