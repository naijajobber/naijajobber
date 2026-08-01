"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminSearch, getAdminOverview } from "@/lib/admin-api";
import { useAuthStore } from "@/store/auth-store";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const clearSession = useAuthStore((s) => s.clearSession);
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getAdminOverview,
    staleTime: 60_000,
  });
  const pending = overview.data?.data?.companies?.pending ?? 0;

  const searchQ = useQuery({
    queryKey: ["admin-search", q],
    queryFn: () => adminSearch(q),
    enabled: q.trim().length >= 2 && searchOpen,
  });

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const searchPayload =
    (searchQ.data as { data?: {
      users?: Array<{ _id: string; email?: string }>;
      companies?: Array<{ _id: string; name?: string }>;
      jobs?: Array<{ _id: string; title?: string }>;
      tickets?: Array<{ _id: string; subject?: string }>;
    } })?.data ||
    (searchQ.data as {
      users?: Array<{ _id: string; email?: string }>;
      companies?: Array<{ _id: string; name?: string }>;
      jobs?: Array<{ _id: string; title?: string }>;
      tickets?: Array<{ _id: string; subject?: string }>;
    });

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
      <AdminSidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-border bg-card px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
            >
              Menu
            </Button>
            <div className="relative hidden max-w-sm flex-1 sm:block">
              <Input
                className="h-9"
                placeholder="Search users, companies, jobs…"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
              />
              {searchOpen && q.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-10 z-40 max-h-72 overflow-auto rounded-lg border border-border bg-card p-2 text-xs shadow-lg">
                  {searchQ.isLoading && (
                    <p className="px-2 py-1 text-muted">Searching…</p>
                  )}
                  {(searchPayload?.users ?? []).map((u) => (
                    <Link
                      key={u._id}
                      href="/dashboard/admin/users"
                      className="block rounded px-2 py-1 hover:bg-background"
                      onClick={() => setSearchOpen(false)}
                    >
                      User · {u.email}
                    </Link>
                  ))}
                  {(searchPayload?.companies ?? []).map((c) => (
                    <Link
                      key={c._id}
                      href="/dashboard/admin/companies"
                      className="block rounded px-2 py-1 hover:bg-background"
                      onClick={() => setSearchOpen(false)}
                    >
                      Company · {c.name}
                    </Link>
                  ))}
                  {(searchPayload?.jobs ?? []).map((j) => (
                    <Link
                      key={j._id}
                      href="/dashboard/admin/jobs"
                      className="block rounded px-2 py-1 hover:bg-background"
                      onClick={() => setSearchOpen(false)}
                    >
                      Job · {j.title}
                    </Link>
                  ))}
                  {(searchPayload?.tickets ?? []).map((t) => (
                    <Link
                      key={t._id}
                      href="/dashboard/admin/support"
                      className="block rounded px-2 py-1 hover:bg-background"
                      onClick={() => setSearchOpen(false)}
                    >
                      Ticket · {t.subject}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <p className="hidden text-sm text-muted md:block">
              {user?.firstName} {user?.lastName}
              <span className="ml-2 text-xs">· {user?.role}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/admin/approvals">
              <Button size="sm" variant="secondary">
                Approvals
                {pending > 0 ? ` (${pending})` : ""}
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
