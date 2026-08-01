"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMyProfile, updateMyProfile, type SeekerProfile } from "@/lib/profiles-api";

type Exp = NonNullable<SeekerProfile["experience"]>[number];

export default function ExperiencePage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["seeker-profile"], queryFn: getMyProfile });
  const [rows, setRows] = useState<Exp[]>([]);

  useEffect(() => {
    setRows(q.data?.data?.experience || []);
  }, [q.data]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">Experience</h1>
      {rows.map((row, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-border p-4">
          <Input
            placeholder="Title"
            value={row.title || ""}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...row, title: e.target.value };
              setRows(next);
            }}
          />
          <Input
            placeholder="Company"
            value={row.company || ""}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...row, company: e.target.value };
              setRows(next);
            }}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Start"
              value={row.startDate || ""}
              onChange={(e) => {
                const next = [...rows];
                next[i] = { ...row, startDate: e.target.value };
                setRows(next);
              }}
            />
            <Input
              placeholder="End"
              value={row.endDate || ""}
              onChange={(e) => {
                const next = [...rows];
                next[i] = { ...row, endDate: e.target.value };
                setRows(next);
              }}
            />
          </div>
          <textarea
            className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Description"
            value={row.description || ""}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...row, description: e.target.value };
              setRows(next);
            }}
          />
        </div>
      ))}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() =>
            setRows([...rows, { title: "", company: "", startDate: "", endDate: "", description: "" }])
          }
        >
          Add role
        </Button>
        <Button
          onClick={async () => {
            await updateMyProfile({ experience: rows });
            await qc.invalidateQueries({ queryKey: ["seeker-profile"] });
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
