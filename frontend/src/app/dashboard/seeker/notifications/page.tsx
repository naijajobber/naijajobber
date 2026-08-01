"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications-api";

export default function SeekerNotificationsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["notifications"], queryFn: listNotifications });
  const items = q.data?.data || [];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Notifications
        </h1>
        <Button
          size="sm"
          variant="secondary"
          onClick={async () => {
            await markAllNotificationsRead();
            await qc.invalidateQueries({ queryKey: ["notifications"] });
            await qc.invalidateQueries({ queryKey: ["seeker-unread"] });
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
            className="w-full rounded-xl border border-border px-3 py-3 text-left text-sm hover:border-accent/40"
            onClick={async () => {
              if (!n.readAt) {
                await markNotificationRead(n._id);
                await qc.invalidateQueries({ queryKey: ["notifications"] });
                await qc.invalidateQueries({ queryKey: ["seeker-unread"] });
              }
            }}
          >
            <p className="font-medium">{n.title}</p>
            <p className="text-xs text-muted">{n.body}</p>
            {!n.readAt && <span className="mt-1 inline-block text-[10px] text-accent">Unread</span>}
          </button>
        ))}
        {!items.length && <p className="text-sm text-muted">No notifications.</p>}
      </div>
    </div>
  );
}
