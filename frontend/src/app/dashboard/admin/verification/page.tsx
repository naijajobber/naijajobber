"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  assignAdminCompanyModerator,
  listAdminCompanies,
  rejectAdminCompany,
  requestAdminCompanyInfo,
  verifyAdminCompany,
  type AdminCompany,
} from "@/lib/admin-api";

function CompanyReviewCard({
  company,
  onDone,
}: {
  company: AdminCompany;
  onDone: () => void;
}) {
  const [note, setNote] = useState("");
  const [moderatorId, setModeratorId] = useState("");
  const [busy, setBusy] = useState(false);
  const docs = company.verificationDocuments ?? [];
  const notes = company.verificationNotes ?? [];

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{company.name}</p>
          <p className="text-xs text-muted">
            /{company.slug} · {company.verificationStatus}
            {company.website ? ` · ${company.website}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={busy}
            onClick={() => run(() => verifyAdminCompany(company._id))}
          >
            Verify
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() =>
              run(() => rejectAdminCompany(company._id, "Incomplete profile"))
            }
          >
            Reject
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium text-muted">Documents</p>
        {docs.length === 0 ? (
          <p className="mt-1 text-xs text-muted">No documents uploaded.</p>
        ) : (
          <ul className="mt-1 space-y-1 text-xs">
            {docs.map((d, i) => (
              <li key={`${d.fileUrl}-${i}`}>
                <a
                  href={d.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  {d.type || "Document"}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {notes.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-muted">Notes</p>
          <ul className="mt-1 space-y-1 text-xs text-muted">
            {notes.map((n, i) => (
              <li key={i}>
                {n.note}
                {n.at ? ` · ${new Date(n.at).toLocaleString()}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          className="h-9 min-w-[12rem] flex-1 rounded-md border border-border bg-background px-2 text-xs"
          placeholder="Request more info…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={busy || !note.trim()}
          onClick={() =>
            run(() => requestAdminCompanyInfo(company._id, note.trim()))
          }
        >
          Request info
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          className="h-9 min-w-[12rem] flex-1 rounded-md border border-border bg-background px-2 text-xs"
          placeholder="Moderator user id"
          value={moderatorId}
          onChange={(e) => setModeratorId(e.target.value)}
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={busy || !moderatorId.trim()}
          onClick={() =>
            run(() =>
              assignAdminCompanyModerator(company._id, moderatorId.trim()),
            )
          }
        >
          Assign moderator
        </Button>
      </div>
    </div>
  );
}

export default function AdminVerificationPage() {
  const qc = useQueryClient();
  const companiesQ = useQuery({
    queryKey: ["admin-companies", "PENDING", "REQUEST_INFO", "verify"],
    queryFn: async () => {
      const [pending, info] = await Promise.all([
        listAdminCompanies({ status: "PENDING", limit: 50 }),
        listAdminCompanies({ status: "REQUEST_INFO", limit: 50 }),
      ]);
      return {
        data: [...(pending.data ?? []), ...(info.data ?? [])],
      };
    },
  });
  const companies = companiesQ.data?.data ?? [];

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin-companies"] });
    void qc.invalidateQueries({ queryKey: ["admin-overview"] });
    void qc.invalidateQueries({ queryKey: ["admin-audit"] });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Employer verification
      </h1>
      <p className="mt-1 text-sm text-muted">
        Review documents, request info, assign moderators, verify or reject.
      </p>

      <div className="mt-6 space-y-3">
        {companies.map((c) => (
          <CompanyReviewCard key={c._id} company={c} onDone={invalidate} />
        ))}
        {companies.length === 0 && !companiesQ.isLoading && (
          <p className="text-sm text-muted">Verification queue is empty.</p>
        )}
      </div>
    </div>
  );
}
