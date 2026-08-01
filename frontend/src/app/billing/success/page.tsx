"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

function SuccessBody() {
  const params = useSearchParams();
  const reference = params.get("reference");

  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
        Payment successful
      </h1>
      <p className="mt-3 text-sm text-muted">
        {reference
          ? `Reference ${reference} completed (mock or provider).`
          : "Your checkout completed."}
      </p>
      <Link href="/dashboard/employer/billing" className="mt-8 inline-block">
        <Button>Back to billing</Button>
      </Link>
    </main>
  );
}

export default function BillingSuccessPage() {
  return (
    <>
      <SiteHeader />
      <Suspense>
        <SuccessBody />
      </Suspense>
      <SiteFooter />
    </>
  );
}
