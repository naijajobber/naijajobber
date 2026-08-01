"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getDashboardPath } from "@/lib/dashboard-path";
import { useAuthStore } from "@/store/auth-store";

/** Role router — sends signed-in users to their shell home. */
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    router.replace(getDashboardPath(user.role));
  }, [user, router]);

  if (!user) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
            Dashboard
          </h1>
          <p className="mt-3 text-muted">Sign in to continue.</p>
          <Link href="/login" className="mt-6 inline-block">
            <Button>Log in</Button>
          </Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-muted">
      Opening your workspace…
    </main>
  );
}
