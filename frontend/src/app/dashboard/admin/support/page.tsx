"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { listAdminTickets, updateAdminTicket } from "@/lib/admin-api";

export default function AdminSupportPage() {
  const [status, setStatus] = useState("");
  const qc = useQueryClient();
  const ticketsQ = useQuery({
    queryKey: ["admin-tickets", status],
    queryFn: () =>
      listAdminTickets({ status: status || undefined, limit: 50 }),
  });
  const tickets = ticketsQ.data?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Support tickets
      </h1>
      <p className="mt-1 text-sm text-muted">
        Assign agents, add internal notes, and transition status.
      </p>

      <select
        className="mt-6 h-11 rounded-md border border-border bg-card px-3 text-sm"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">All</option>
        <option value="OPEN">OPEN</option>
        <option value="IN_PROGRESS">IN_PROGRESS</option>
        <option value="RESOLVED">RESOLVED</option>
        <option value="CLOSED">CLOSED</option>
      </select>

      <div className="mt-6 space-y-3">
        {tickets.map((t) => (
          <div
            key={t._id}
            className="rounded-xl border border-border bg-card p-4 text-sm"
          >
            <p className="font-medium">{t.subject}</p>
            <p className="text-xs text-muted">
              {t.status} · {t.category || "General"}
              {t.createdAt
                ? ` · ${new Date(t.createdAt).toLocaleString()}`
                : ""}
            </p>
            {t.body && <p className="mt-2 text-xs">{t.body}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {["IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    await updateAdminTicket(t._id, { status: s });
                    void qc.invalidateQueries({ queryKey: ["admin-tickets"] });
                  }}
                >
                  {s}
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  const note = prompt("Internal note");
                  if (!note) return;
                  await updateAdminTicket(t._id, { note });
                  void qc.invalidateQueries({ queryKey: ["admin-tickets"] });
                }}
              >
                Add note
              </Button>
            </div>
          </div>
        ))}
        {tickets.length === 0 && !ticketsQ.isLoading && (
          <p className="text-sm text-muted">No tickets.</p>
        )}
      </div>
    </div>
  );
}
