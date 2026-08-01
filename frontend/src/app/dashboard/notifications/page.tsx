"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications-api";
import { useAuthStore } from "@/store/auth-store";

export default function NotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    if (user?.role === "JOB_SEEKER") {
      router.replace("/dashboard/seeker/notifications");
    }
  }, [user, router]);

  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
    enabled: !!user && user.role !== "JOB_SEEKER",
  });
  const items = q.data?.data || [];

  if (user?.role === "JOB_SEEKER") {
    return <p className="p-8 text-sm text-muted">Redirecting…</p>;
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
            Notifications
          </h1>
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              await markAllNotificationsRead();
              await qc.invalidateQueries({ queryKey: ["notifications"] });
            }}
          >
            Mark all read
          </Button>
        </div>
        <div className="mt-6 space-y-2">
          {items.map((n) => (
            <button
              key={n._id}
              type="button"
              className="w-full rounded-xl border border-border px-3 py-3 text-left text-sm"
              onClick={async () => {
                if (!n.readAt) {
                  await markNotificationRead(n._id);
                  await qc.invalidateQueries({ queryKey: ["notifications"] });
                }
              }}
            >
              <p className="font-medium">{n.title}</p>
              <p className="text-xs text-muted">{n.body}</p>
            </button>
          ))}
          {!items.length && (
            <p className="text-sm text-muted">No notifications.</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
