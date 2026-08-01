"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deactivateTeamMember,
  inviteTeamMember,
  listTeamMembers,
  removeTeamMember,
  updateTeamMemberRole,
} from "@/lib/employer-api";

const ROLES = [
  "OWNER",
  "HR_MANAGER",
  "RECRUITER",
  "HIRING_MANAGER",
  "VIEWER",
];

export default function TeamPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["employer-team"], queryFn: listTeamMembers });
  const members =
    (q.data?.data as Array<{
      _id: string;
      title?: string;
      companyRole?: string;
      inviteStatus?: string;
      inviteEmail?: string;
      userId?: string;
    }> | undefined) || [];
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("RECRUITER");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Team members
        </h1>
        <p className="mt-1 text-sm text-muted">
          Invite recruiters and assign company-scoped roles.
        </p>
      </div>
      {message && <p className="text-sm text-accent">{message}</p>}

      <div className="flex flex-wrap gap-2">
        <Input
          className="min-w-[12rem] flex-1"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="h-10 rounded-md border border-border bg-background px-2 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <Button
          onClick={async () => {
            await inviteTeamMember({ email, companyRole: role });
            setEmail("");
            setMessage("Invite sent");
            await qc.invalidateQueries({ queryKey: ["employer-team"] });
          }}
        >
          Invite
        </Button>
      </div>

      <ul className="space-y-2">
        {members.map((m) => (
          <li
            key={m._id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-3 text-sm"
          >
            <div>
              <p className="font-medium">
                {m.inviteEmail || m.title || m.userId}
              </p>
              <p className="text-xs text-muted">
                {m.companyRole} · {m.inviteStatus}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              <select
                className="h-8 rounded border border-border bg-background px-1 text-xs"
                value={m.companyRole || "RECRUITER"}
                onChange={async (e) => {
                  await updateTeamMemberRole(m._id, e.target.value);
                  await qc.invalidateQueries({ queryKey: ["employer-team"] });
                }}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await deactivateTeamMember(m._id);
                  await qc.invalidateQueries({ queryKey: ["employer-team"] });
                }}
              >
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await removeTeamMember(m._id);
                  await qc.invalidateQueries({ queryKey: ["employer-team"] });
                }}
              >
                Remove
              </Button>
            </div>
          </li>
        ))}
        {!members.length && (
          <li className="text-sm text-muted">No team members yet.</li>
        )}
      </ul>
    </div>
  );
}
