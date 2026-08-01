"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  resubmitVerification,
  uploadVerificationDocument,
} from "@/lib/employer-api";
import { getMyCompany } from "@/lib/jobs-api";

const DOC_TYPES = [
  "CAC_REGISTRATION",
  "TAX_CERTIFICATE",
  "BUSINESS_LICENSE",
  "GOVERNMENT_REGISTRATION",
  "UTILITY_BILL",
  "AUTHORIZED_REP_ID",
];

export default function CompanyVerificationPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-company"],
    queryFn: getMyCompany,
  });
  const company = data?.data;
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (!company) {
    return (
      <div className="max-w-lg">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Company verification
        </h1>
        <p className="mt-2 text-sm text-muted">
          Create a company profile first.
        </p>
        <Link href="/dashboard/employer/company" className="mt-6 inline-block">
          <Button>Create company</Button>
        </Link>
      </div>
    );
  }

  const status = company.verificationStatus;
  const docs = company.verificationDocuments || [];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Company verification
        </h1>
        <p className="mt-1 text-sm text-muted">
          Upload KYC documents. Admins review and approve or reject.
        </p>
      </div>

      {message && <p className="text-sm text-accent">{message}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="font-medium">{company.name}</p>
        <p className="mt-2 inline-block rounded-md border border-border px-2 py-1 text-xs uppercase">
          {status}
        </p>
        {status === "REJECTED" && company.rejectionReason && (
          <p className="mt-3 text-sm text-red-500">
            Reason: {company.rejectionReason}
          </p>
        )}
        <ol className="mt-4 space-y-1 text-xs text-muted">
          <li>1. Pending — documents submitted</li>
          <li>2. Admin review</li>
          <li>3. Approved (verified badge) or Rejected</li>
        </ol>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Upload document</h2>
        <select
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
        >
          {DOC_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept=".pdf,image/*"
          className="block w-full text-sm"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setError(null);
            setMessage(null);
            try {
              await uploadVerificationDocument(file, docType);
              await qc.invalidateQueries({ queryKey: ["my-company"] });
              setMessage("Document uploaded");
            } catch (err) {
              setError(
                (err as { response?: { data?: { message?: string } } })
                  ?.response?.data?.message || "Upload failed",
              );
            }
          }}
        />
      </section>

      {!!docs.length && (
        <section>
          <h2 className="text-lg font-semibold">Uploaded</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {docs.map((d, i) => (
              <li
                key={`${d.type}-${i}`}
                className="flex justify-between rounded-lg border border-border px-3 py-2"
              >
                <span>{d.type.replace(/_/g, " ")}</span>
                <a
                  href={d.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        {(status === "REJECTED" || status === "PENDING") && (
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                await resubmitVerification();
                await qc.invalidateQueries({ queryKey: ["my-company"] });
                setMessage("Resubmitted for review");
              } catch (err) {
                setError(
                  (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message || "Resubmit failed",
                );
              }
            }}
          >
            Resubmit for review
          </Button>
        )}
        <Link href="/dashboard/employer/company">
          <Button variant="secondary">Edit company</Button>
        </Link>
      </div>
    </div>
  );
}
