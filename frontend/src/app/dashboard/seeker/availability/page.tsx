"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getMyProfile, updateMyProfile } from "@/lib/profiles-api";

const OPTIONS = [
  { value: "AVAILABLE_IMMEDIATELY", label: "Available Immediately" },
  { value: "OPEN_TO_WORK", label: "Open to Work" },
  { value: "NOT_LOOKING", label: "Not Looking" },
  { value: "AVAILABLE_NEXT_MONTH", label: "Available Next Month" },
];

export default function AvailabilityPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["seeker-profile"], queryFn: getMyProfile });
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setStatus(q.data?.data?.availabilityStatus || "");
  }, [q.data]);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Availability Status
      </h1>
      <p className="text-sm text-muted">
        Tell employers when you are open to opportunities. Visible based on profile visibility.
      </p>
      {message && <p className="text-sm text-accent">{message}</p>}
      <div className="space-y-2">
        {OPTIONS.map((o) => (
          <label
            key={o.value}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
              status === o.value ? "border-accent bg-card" : "border-border bg-card"
            }`}
          >
            <input
              type="radio"
              name="availability"
              checked={status === o.value}
              onChange={() => setStatus(o.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
      <Button
        onClick={async () => {
          await updateMyProfile({ availabilityStatus: status });
          await qc.invalidateQueries({ queryKey: ["seeker-profile"] });
          setMessage("Availability saved");
        }}
      >
        Save
      </Button>
    </div>
  );
}
