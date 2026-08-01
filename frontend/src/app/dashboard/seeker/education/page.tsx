"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMyProfile, updateMyProfile, type SeekerProfile } from "@/lib/profiles-api";

type Edu = NonNullable<SeekerProfile["education"]>[number];

export default function EducationPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["seeker-profile"], queryFn: getMyProfile });
  const [rows, setRows] = useState<Edu[]>([]);

  useEffect(() => {
    setRows(q.data?.data?.education || []);
  }, [q.data]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">Education</h1>
      {rows.map((row, i) => (
        <div key={i} className="grid gap-2 rounded-xl border border-border p-4 sm:grid-cols-3">
          <Input
            placeholder="School"
            value={row.school || ""}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...row, school: e.target.value };
              setRows(next);
            }}
          />
          <Input
            placeholder="Degree"
            value={row.degree || ""}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...row, degree: e.target.value };
              setRows(next);
            }}
          />
          <Input
            placeholder="Year"
            value={row.year || ""}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...row, year: e.target.value };
              setRows(next);
            }}
          />
        </div>
      ))}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => setRows([...rows, { school: "", degree: "", year: "" }])}>
          Add education
        </Button>
        <Button
          onClick={async () => {
            await updateMyProfile({ education: rows });
            await qc.invalidateQueries({ queryKey: ["seeker-profile"] });
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
