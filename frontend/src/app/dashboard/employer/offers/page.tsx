"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOffer, listOffers } from "@/lib/employer-api";

export default function OffersPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["offers"], queryFn: listOffers });
  const items =
    (q.data?.data as Array<{
      _id: string;
      position?: string;
      salary?: string;
      status?: string;
      startDate?: string;
    }> | undefined) || [];
  const [form, setForm] = useState({
    applicationId: "",
    position: "",
    salary: "",
    benefits: "",
    startDate: "",
    employmentType: "FULL_TIME",
  });

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Offers
      </h1>
      <p className="text-sm text-muted">
        Generate offer letters. Candidates accept digitally via API.
      </p>
      <Input
        placeholder="Application id"
        value={form.applicationId}
        onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
      />
      <Input
        placeholder="Position"
        value={form.position}
        onChange={(e) => setForm({ ...form, position: e.target.value })}
      />
      <Input
        placeholder="Salary"
        value={form.salary}
        onChange={(e) => setForm({ ...form, salary: e.target.value })}
      />
      <Input
        placeholder="Benefits"
        value={form.benefits}
        onChange={(e) => setForm({ ...form, benefits: e.target.value })}
      />
      <Input
        type="date"
        value={form.startDate}
        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
      />
      <Button
        onClick={async () => {
          await createOffer(form);
          await qc.invalidateQueries({ queryKey: ["offers"] });
        }}
      >
        Create offer
      </Button>
      <ul className="space-y-2">
        {items.map((o) => (
          <li
            key={o._id}
            className="rounded-xl border border-border px-3 py-3 text-sm"
          >
            <p className="font-medium">{o.position}</p>
            <p className="text-xs text-muted">
              {o.salary} · {o.status} · {o.startDate}
            </p>
          </li>
        ))}
        {!items.length && (
          <li className="text-sm text-muted">No offers yet.</li>
        )}
      </ul>
    </div>
  );
}
