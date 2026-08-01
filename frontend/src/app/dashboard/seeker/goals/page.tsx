"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMyProfile, updateMyProfile, type CareerGoals } from "@/lib/profiles-api";

export default function GoalsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["seeker-profile"], queryFn: getMyProfile });
  const [goals, setGoals] = useState<CareerGoals>({
    desiredRole: "",
    targetSalary: "",
    preferredCountries: [],
    preferredCompanies: [],
    industries: [],
    careerObjectives: "",
    learningGoals: "",
  });
  const [countries, setCountries] = useState("");
  const [companies, setCompanies] = useState("");
  const [industries, setIndustries] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const g = q.data?.data?.careerGoals;
    if (g) {
      setGoals(g);
      setCountries((g.preferredCountries || []).join(", "));
      setCompanies((g.preferredCompanies || []).join(", "));
      setIndustries((g.industries || []).join(", "));
    }
  }, [q.data]);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Career Goals
      </h1>
      <p className="text-sm text-muted">
        Set target roles, salary bands, and learning goals.
      </p>
      {message && <p className="text-sm text-accent">{message}</p>}
      <Input
        placeholder="Desired role"
        value={goals.desiredRole || ""}
        onChange={(e) => setGoals({ ...goals, desiredRole: e.target.value })}
      />
      <Input
        placeholder="Target salary"
        value={goals.targetSalary || ""}
        onChange={(e) => setGoals({ ...goals, targetSalary: e.target.value })}
      />
      <Input
        placeholder="Preferred countries (comma-separated)"
        value={countries}
        onChange={(e) => setCountries(e.target.value)}
      />
      <Input
        placeholder="Preferred companies"
        value={companies}
        onChange={(e) => setCompanies(e.target.value)}
      />
      <Input
        placeholder="Industries"
        value={industries}
        onChange={(e) => setIndustries(e.target.value)}
      />
      <textarea
        className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        placeholder="Career objectives"
        value={goals.careerObjectives || ""}
        onChange={(e) =>
          setGoals({ ...goals, careerObjectives: e.target.value })
        }
      />
      <textarea
        className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        placeholder="Learning goals"
        value={goals.learningGoals || ""}
        onChange={(e) => setGoals({ ...goals, learningGoals: e.target.value })}
      />
      <Button
        onClick={async () => {
          await updateMyProfile({
            careerGoals: {
              ...goals,
              preferredCountries: countries
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              preferredCompanies: companies
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              industries: industries
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            },
          });
          await qc.invalidateQueries({ queryKey: ["seeker-profile"] });
          setMessage("Goals saved");
        }}
      >
        Save goals
      </Button>
    </div>
  );
}
