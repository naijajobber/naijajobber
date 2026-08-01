"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyEmail } from "@/lib/api";

const schema = z.object({ token: z.string().min(10) });

function VerifyForm() {
  const params = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ token: string }>({
    resolver: zodResolver(schema),
    defaultValues: { token: params.get("token") || "" },
  });

  const onSubmit = handleSubmit(async ({ token }) => {
    setError(null);
    try {
      const res = await verifyEmail(token);
      setMessage(res.message || "Email verified");
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Verification failed",
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <Input placeholder="Verification token" {...register("token")} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {message && <p className="text-sm text-accent">{message}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Verify email
      </Button>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Verify email
        </h1>
        <p className="mt-2 text-sm text-muted">
          Paste the token from your verification email (logged in API console for local
          dev).
        </p>
        <Suspense>
          <VerifyForm />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
