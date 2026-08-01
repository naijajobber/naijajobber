"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listAdminCompanies } from "@/lib/admin-api";

export default function AdminCompaniesPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const companiesQ = useQuery({
    queryKey: ["admin-companies", search, status],
    queryFn: () =>
      listAdminCompanies({
        q: search || undefined,
        status: status || undefined,
        limit: 50,
      }),
  });

  const companies = companiesQ.data?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Companies
      </h1>
      <p className="mt-1 text-sm text-muted">
        All registered company profiles with document counts.
      </p>

      <form
        className="mt-6 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(q.trim());
        }}
      >
        <Input
          className="min-w-[12rem] flex-1"
          placeholder="Search name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="h-11 rounded-md border border-border bg-card px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="REQUEST_INFO">REQUEST_INFO</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      <div className="mt-6 space-y-2">
        {companies.map((c) => (
          <div
            key={c._id}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
          >
            <p className="font-medium">{c.name}</p>
            <p className="text-xs text-muted">
              /{c.slug} · {c.verificationStatus}
              {c.industry ? ` · ${c.industry}` : ""} · docs:{" "}
              {c.verificationDocuments?.length ?? 0}
              {c.assignedModeratorUserId
                ? ` · moderator assigned`
                : ""}
            </p>
          </div>
        ))}
        {companies.length === 0 && !companiesQ.isLoading && (
          <p className="text-sm text-muted">No companies found.</p>
        )}
      </div>
    </div>
  );
}
