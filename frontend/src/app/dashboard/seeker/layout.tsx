"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SeekerShell } from "@/components/dashboard/seeker-shell";
import { getDashboardPath, isSeekerRole } from "@/lib/dashboard-path";
import { useAuthStore } from "@/store/auth-store";

export default function SeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login?next=/dashboard/seeker");
      return;
    }
    if (!isSeekerRole(user.role)) {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, router]);

  if (!user || !isSeekerRole(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading seeker workspace…
      </div>
    );
  }

  return <SeekerShell>{children}</SeekerShell>;
}
