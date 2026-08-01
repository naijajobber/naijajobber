"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployerMessagesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/messages");
  }, [router]);

  return (
    <p className="text-sm text-muted">Opening messages…</p>
  );
}
