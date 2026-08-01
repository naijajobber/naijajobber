"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, MessageSquare, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getDashboardPath } from "@/lib/dashboard-path";
import { unreadNotificationCount } from "@/lib/notifications-api";
import { useAuthStore } from "@/store/auth-store";

const nav = [
  { href: "/#jobs", label: "Opportunities" },
  { href: "/#categories", label: "Explore" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  const notifCountQuery = useQuery({
    queryKey: ["notif-count"],
    queryFn: unreadNotificationCount,
    enabled: !!user,
    refetchInterval: 30_000,
  });
  const unread = notifCountQuery.data?.data?.count ?? 0;

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.jpeg"
            alt="NaijaJobber"
            width={36}
            height={36}
            className="rounded-md"
            priority
          />
          <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">
            NaijaJobber
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
          )}
          <div className="hidden items-center gap-2 sm:flex">
            {user ? (
              <>
                <Link href="/dashboard/messages" aria-label="Messages">
                  <Button variant="ghost" size="sm">
                    <MessageSquare size={16} />
                  </Button>
                </Link>
                <Link href="/dashboard/notifications" aria-label="Notifications">
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell size={16} />
                    {unread > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-primary-foreground">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href={getDashboardPath(user.role)}>
                  <Button variant="secondary" size="sm">
                    Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)}>
              Log in
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}>
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
