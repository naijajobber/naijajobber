"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { JobsListPage } from "@/components/dashboard/jobs-list-page";
import { Button } from "@/components/ui/button";
import { createCheckout } from "@/lib/billing-api";

export default function FeaturedJobsPage() {
  const qc = useQueryClient();
  const checkout = useMutation({
    mutationFn: () =>
      createCheckout({ purpose: "FEATURED_JOB", provider: "mock" }),
    onSuccess: (res) => {
      const url = res.data?.checkoutUrl;
      if (url) window.location.href = url;
      void qc.invalidateQueries({ queryKey: ["my-sub"] });
    },
  });

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted">
          Featured publish requires Employer Pro or a FEATURED_JOB purchase.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => checkout.mutate()}
            disabled={checkout.isPending}
          >
            Buy featured entitlement
          </Button>
          <Link href="/dashboard/employer/billing">
            <Button size="sm" variant="secondary">
              Subscription plans
            </Button>
          </Link>
        </div>
      </div>
      <JobsListPage filter="featured" />
    </div>
  );
}
