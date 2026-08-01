"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupportTicket, listSupportTickets } from "@/lib/employer-api";

const CATEGORIES = [
  "Billing",
  "Technical",
  "Verification",
  "Recruitment",
  "General",
];

export default function SupportPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["support-tickets"],
    queryFn: listSupportTickets,
  });
  const tickets =
    (q.data?.data as Array<{
      _id: string;
      subject: string;
      category: string;
      status: string;
      body?: string;
    }> | undefined) || [];
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General");
  const [body, setBody] = useState("");

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Support center
      </h1>
      <p className="text-sm text-muted">Submit and track support tickets.</p>
      <Input
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <select
        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <textarea
        className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        placeholder="Describe the issue"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <Button
        onClick={async () => {
          await createSupportTicket({ subject, category, body });
          setSubject("");
          setBody("");
          await qc.invalidateQueries({ queryKey: ["support-tickets"] });
        }}
      >
        Submit ticket
      </Button>
      <ul className="space-y-2">
        {tickets.map((t) => (
          <li
            key={t._id}
            className="rounded-xl border border-border px-3 py-3 text-sm"
          >
            <p className="font-medium">{t.subject}</p>
            <p className="text-xs text-muted">
              {t.category} · {t.status}
            </p>
          </li>
        ))}
        {!tickets.length && (
          <li className="text-sm text-muted">No tickets yet.</li>
        )}
      </ul>
    </div>
  );
}
