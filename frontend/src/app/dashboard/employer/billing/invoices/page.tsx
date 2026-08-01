"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { listInvoices } from "@/lib/billing-api";

export default function InvoicesPage() {
  const invQuery = useQuery({ queryKey: ["invoices"], queryFn: listInvoices });
  const invoices = invQuery.data?.data ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-muted">
            Billing history for subscriptions and add-ons.
          </p>
        </div>
        <Link href="/dashboard/employer/billing">
          <Button size="sm" variant="secondary">
            Plans
          </Button>
        </Link>
      </div>

      <div className="mt-8 space-y-2">
        {invoices.map((inv) => (
          <div
            key={inv._id}
            className="flex justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm"
          >
            <span>{inv.number}</span>
            <span>
              {inv.currency} {inv.total}
            </span>
          </div>
        ))}
        {invoices.length === 0 && (
          <p className="text-sm text-muted">No invoices yet.</p>
        )}
      </div>
    </div>
  );
}
