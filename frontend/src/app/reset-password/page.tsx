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
import { resetPassword } from "@/lib/api";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

function ResetForm() {
  const params = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { token: params.get("token") || "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const res = await resetPassword(values.token, values.password);
      setMessage(res.message);
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Reset failed",
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <Input placeholder="Reset token" {...register("token")} />
      <Input
        type="password"
        placeholder="New password"
        {...register("password")}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {message && <p className="text-sm text-accent">{message}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Reset password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Reset password
        </h1>
        <Suspense>
          <ResetForm />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
