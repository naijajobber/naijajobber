"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDashboardPath, isSeekerRole } from "@/lib/dashboard-path";
import { useAuthStore } from "@/store/auth-store";

export default function LegacySettingsRedirect() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  useEffect(() => {
    if (!role) {
      router.replace("/login?next=/dashboard/settings");
      return;
    }
    router.replace(
      isSeekerRole(role)
        ? "/dashboard/seeker/settings"
        : getDashboardPath(role),
    );
  }, [router, role]);
  return <p className="p-8 text-sm text-muted">Redirecting…</p>;
}
