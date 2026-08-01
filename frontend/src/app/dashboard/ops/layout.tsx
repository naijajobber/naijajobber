"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { OpsShell } from "@/components/dashboard/ops-shell";
import { isOpsHrefAllowed } from "@/config/ops-nav";
import { getDashboardPath, isOpsRole } from "@/lib/dashboard-path";
import { useAuthStore } from "@/store/auth-store";

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      router.replace("/login?next=/dashboard/ops");
      return;
    }
    if (!isOpsRole(user.role)) {
      router.replace(getDashboardPath(user.role));
      return;
    }
    if (pathname && !isOpsHrefAllowed(user.role, pathname)) {
      router.replace("/dashboard/ops");
    }
  }, [user, router, pathname]);

  if (!user || !isOpsRole(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading ops workspace…
      </div>
    );
  }

  if (pathname && !isOpsHrefAllowed(user.role, pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Redirecting…
      </div>
    );
  }

  return <OpsShell>{children}</OpsShell>;
}
