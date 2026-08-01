"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EmployerShell } from "@/components/dashboard/employer-shell";
import { getDashboardPath, isEmployerRole } from "@/lib/dashboard-path";
import { useAuthStore } from "@/store/auth-store";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login?next=/dashboard/employer");
      return;
    }
    if (!isEmployerRole(user.role)) {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, router]);

  if (!user || !isEmployerRole(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading employer workspace…
      </div>
    );
  }

  return <EmployerShell>{children}</EmployerShell>;
}
