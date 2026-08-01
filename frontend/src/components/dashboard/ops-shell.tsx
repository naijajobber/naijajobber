"use client";

import { useEffect, useState } from "react";
import { OpsSidebar } from "@/components/dashboard/ops-sidebar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function OpsShell({ children }: { children: React.ReactNode }) {
  const clearSession = useAuthStore((s) => s.clearSession);
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);

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
      <OpsSidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
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
              <span className="ml-2 text-xs">· {user?.role}</span>
            </p>
          </div>
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
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
