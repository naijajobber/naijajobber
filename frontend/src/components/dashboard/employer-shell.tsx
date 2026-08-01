"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmployerSidebar } from "@/components/dashboard/employer-sidebar";
import { Button } from "@/components/ui/button";
import { unreadNotificationCount } from "@/lib/notifications-api";
import { useAuthStore } from "@/store/auth-store";

export function EmployerShell({ children }: { children: React.ReactNode }) {
  const clearSession = useAuthStore((s) => s.clearSession);
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);

  const unread = useQuery({
    queryKey: ["employer-unread"],
    queryFn: unreadNotificationCount,
    enabled: !!user,
    refetchInterval: 60_000,
  });

  const count = unread.data?.data?.count ?? 0;

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <EmployerSidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-border bg-card px-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
            >
              Menu
            </Button>
            <p className="hidden text-sm text-muted sm:block">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/notifications">
              <Button size="sm" variant="ghost">
                Alerts{count > 0 ? ` (${count})` : ""}
              </Button>
            </Link>
            <Link href="/dashboard/employer/jobs/new">
              <Button size="sm" variant="secondary">
                Post job
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                clearSession();
                window.location.href = "/login";
              }}
            >
              Log out
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
