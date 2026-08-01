"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/lib/api";

const schema = z.object({ email: z.string().email() });

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ email: string }>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async ({ email }) => {
    const res = await forgotPassword(email);
    setMessage(res.message);
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Forgot password
        </h1>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Input type="email" placeholder="Email" {...register("email")} />
          {message && <p className="text-sm text-accent">{message}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Send reset link
          </Button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
