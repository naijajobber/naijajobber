"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Messages live on the shared messaging workspace. */
export default function OpsMessagesRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/messages");
  }, [router]);

  return (
    <p className="text-sm text-muted">Opening messages…</p>
  );
}
