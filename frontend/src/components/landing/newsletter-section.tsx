"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Get remote roles in your inbox
        </h2>
        <p className="mt-2 text-muted">
          Weekly curated openings for African talent. No spam.
        </p>
        {done ? (
          <p className="mt-6 text-sm text-accent">You&apos;re on the list. Welcome aboard.</p>
        ) : (
          <form
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <Input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit">Subscribe</Button>
          </form>
        )}
      </div>
    </section>
  );
}
