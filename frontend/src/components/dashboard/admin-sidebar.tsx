"use client";

import Link from "next/link";
import { DashboardNavGroups } from "@/components/dashboard/dashboard-nav-groups";
import { ADMIN_NAV } from "@/config/admin-nav";
import { cn } from "@/lib/utils";

export function AdminSidebar({
  open,
  onNavigate,
}: {
  open?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-border bg-card",
        "fixed inset-y-0 left-0 z-40 transition-transform lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="border-b border-border px-4 py-4">
        <Link
          href="/dashboard/admin"
          className="cursor-pointer font-[family-name:var(--font-display)] text-lg font-bold text-accent"
          onClick={onNavigate}
        >
          NaijaJobber
        </Link>
        <p className="mt-0.5 text-xs text-muted">Admin panel</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <DashboardNavGroups groups={ADMIN_NAV} onNavigate={onNavigate} />
      </nav>
    </aside>
  );
}
