"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense, useState } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/lib/api";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["JOB_SEEKER", "EMPLOYER"]),
});

type FormValues = z.infer<typeof schema>;

function RegisterForm() {
  const params = useSearchParams();
  const defaultRole =
    params.get("role") === "employer" ? "EMPLOYER" : "JOB_SEEKER";
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setMessage(null);
    try {
      const res = await registerUser(values);
      setMessage(
        res.message ||
          "Registration successful. Check the API console for your verification link.",
      );
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Registration failed";
      setError(msg);
    }
  });

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="First name" {...register("firstName")} />
        <Input placeholder="Last name" {...register("lastName")} />
      </div>
      <Input type="email" placeholder="Email" {...register("email")} />
      <Input
        type="password"
        placeholder="Password"
        {...register("password")}
      />
      <select
        className="flex h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
        {...register("role")}
      >
        <option value="JOB_SEEKER">Job seeker</option>
        <option value="EMPLOYER">Employer</option>
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {message && <p className="text-sm text-accent">{message}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted">
          Join NaijaJobber as talent or an employer.
        </p>
        <Suspense fallback={<p className="mt-8 text-sm text-muted">Loading…</p>}>
          <RegisterForm />
        </Suspense>
        <p className="mt-4 text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
