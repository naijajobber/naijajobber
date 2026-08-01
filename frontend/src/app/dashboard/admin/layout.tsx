"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/dashboard/admin-shell";
import { getDashboardPath, isAdminRole } from "@/lib/dashboard-path";
import { useAuthStore } from "@/store/auth-store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login?next=/dashboard/admin");
      return;
    }
    if (!isAdminRole(user.role)) {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, router]);

  if (!user || !isAdminRole(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading admin panel…
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
