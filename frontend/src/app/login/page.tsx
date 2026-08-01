"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense, useState } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginUser } from "@/lib/api";
import { getDashboardPath } from "@/lib/dashboard-path";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const res = await loginUser(values);
      if (!res.data?.accessToken) {
        throw new Error(res.message || "Login failed");
      }
      setSession(res.data);
      const next = searchParams.get("next");
      const safeNext =
        next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      router.push(safeNext || getDashboardPath(res.data.user?.role));
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error).message ||
        "Login failed";
      setError(message);
    }
  });

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <Input type="email" placeholder="Email" {...register("email")} />
      <Input
        type="password"
        placeholder="Password"
        {...register("password")}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Log in"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-muted">
          Log in and keep grinding — opportunity never sleeps.
        </p>
        <Suspense fallback={<p className="mt-8 text-sm text-muted">Loading…</p>}>
          <LoginForm />
        </Suspense>
        <p className="mt-4 text-sm text-muted">
          <Link href="/forgot-password" className="text-accent hover:underline">
            Forgot password?
          </Link>
        </p>
        <p className="mt-2 text-sm text-muted">
          New here?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
