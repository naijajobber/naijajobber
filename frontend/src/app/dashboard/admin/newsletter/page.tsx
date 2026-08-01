"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { broadcastAdminNotification } from "@/lib/admin-api";

export default function AdminNewsletterPage() {
  const [audience, setAudience] = useState("ALL");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Broadcast / Newsletter
      </h1>
      <p className="mt-1 text-sm text-muted">
        Creates in-app notifications in bulk (email is mock-logged).
      </p>

      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setResult(null);
          try {
            const res = await broadcastAdminNotification({
              audience,
              title,
              body,
              channels: ["in_app"],
            });
            const created =
              (res as { data?: { created?: number } })?.data?.created ??
              (res as { created?: number })?.created;
            setResult(`Broadcast sent to ${created ?? 0} users.`);
            setTitle("");
            setBody("");
          } finally {
            setBusy(false);
          }
        }}
      >
        <select
          className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
        >
          <option value="ALL">All users</option>
          <option value="EMPLOYERS">Employers</option>
          <option value="JOB_SEEKERS">Job seekers</option>
          <option value="RECRUITERS">Recruiters</option>
        </select>
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="min-h-[120px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
          placeholder="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <Button type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send broadcast"}
        </Button>
      </form>
      {result && <p className="mt-4 text-sm text-accent">{result}</p>}
    </div>
  );
}
