"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getMyProfile,
  updateMyProfile,
  type CertificateItem,
} from "@/lib/profiles-api";

export default function CertificatesPage() {
  const qc = useQueryClient();
  const profileQ = useQuery({ queryKey: ["seeker-profile"], queryFn: getMyProfile });
  const certificates = profileQ.data?.data?.certificates ?? [];
  const [draft, setDraft] = useState<CertificateItem>({
    name: "",
    organization: "",
    issueDate: "",
    expiryDate: "",
    credentialUrl: "",
    credentialId: "",
    fileUrl: "",
  });
  const [error, setError] = useState<string | null>(null);

  const save = async (next: CertificateItem[]) => {
    setError(null);
    try {
      await updateMyProfile({ certificates: next });
      await qc.invalidateQueries({ queryKey: ["seeker-profile"] });
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save",
      );
    }
  };

  if (profileQ.isLoading) {
    return <p className="text-sm text-muted">Loading certificates…</p>;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Certificates
        </h1>
        <p className="mt-1 text-sm text-muted">
          Track professional certificates and licenses.
        </p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-2">
        {certificates.map((c, idx) => (
          <div
            key={`${c.name}-${idx}`}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted">
                  {c.organization}
                  {c.issueDate ? ` · Issued ${c.issueDate}` : ""}
                </p>
                {c.credentialUrl && (
                  <a
                    href={c.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-accent hover:underline"
                  >
                    Credential
                  </a>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => save(certificates.filter((_, i) => i !== idx))}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        {certificates.length === 0 && (
          <p className="text-sm text-muted">No certificates yet.</p>
        )}
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <Input placeholder="Certificate name" value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <Input placeholder="Issuing organization" value={draft.organization || ""} onChange={(e) => setDraft({ ...draft, organization: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input type="date" placeholder="Issue date" value={draft.issueDate || ""} onChange={(e) => setDraft({ ...draft, issueDate: e.target.value })} />
          <Input type="date" placeholder="Expiry date" value={draft.expiryDate || ""} onChange={(e) => setDraft({ ...draft, expiryDate: e.target.value })} />
        </div>
        <Input placeholder="Credential URL" value={draft.credentialUrl || ""} onChange={(e) => setDraft({ ...draft, credentialUrl: e.target.value })} />
        <Input placeholder="Credential ID" value={draft.credentialId || ""} onChange={(e) => setDraft({ ...draft, credentialId: e.target.value })} />
        <Input placeholder="Certificate file URL" value={draft.fileUrl || ""} onChange={(e) => setDraft({ ...draft, fileUrl: e.target.value })} />
        <Button
          onClick={() => {
            if (!draft.name?.trim()) return;
            void save([...certificates, draft]);
            setDraft({
              name: "",
              organization: "",
              issueDate: "",
              expiryDate: "",
              credentialUrl: "",
              credentialId: "",
              fileUrl: "",
            });
          }}
        >
          Add certificate
        </Button>
      </div>
    </div>
  );
}
