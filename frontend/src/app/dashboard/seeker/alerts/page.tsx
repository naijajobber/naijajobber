"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMyProfile, updateAlertPrefs } from "@/lib/profiles-api";

export default function JobAlertsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["seeker-profile"], queryFn: getMyProfile });
  const [enabled, setEnabled] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [country, setCountry] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [industry, setIndustry] = useState("");
  const [category, setCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [workplaceTypes, setWorkplaceTypes] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const prefs = q.data?.data?.jobAlertPrefs;
    if (prefs) {
      setEnabled(!!prefs.enabled);
      setKeywords((prefs.keywords || []).join(", "));
      setFrequency(prefs.frequency || "weekly");
      setCountry(prefs.country || "");
      setSalaryMin(prefs.salaryMin || "");
      setIndustry(prefs.industry || "");
      setCategory(prefs.category || "");
      setExperience(prefs.experience || "");
      setWorkplaceTypes(prefs.workplaceTypes || []);
    }
  }, [q.data]);

  const toggleWorkplace = (w: string) => {
    setWorkplaceTypes((prev) =>
      prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w],
    );
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Job Alerts
      </h1>
      <p className="text-sm text-muted">
        Manage alert subscriptions and delivery frequency.
      </p>
      {message && <p className="text-sm text-accent">{message}</p>}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        Enable alerts
      </label>
      <Input
        placeholder="Keywords (comma-separated)"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
      />
      <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
      <Input placeholder="Minimum salary" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
      <Input placeholder="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
      <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
      <Input placeholder="Experience level" value={experience} onChange={(e) => setExperience(e.target.value)} />
      <div className="flex flex-wrap gap-3 text-sm">
        {["REMOTE", "HYBRID", "ONSITE"].map((w) => (
          <label key={w} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={workplaceTypes.includes(w)}
              onChange={() => toggleWorkplace(w)}
            />
            {w}
          </label>
        ))}
      </div>
      <select
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
      >
        <option value="instant">Instant</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>
      <Button
        onClick={async () => {
          await updateAlertPrefs({
            enabled,
            keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
            frequency,
            country,
            salaryMin,
            industry,
            category,
            experience,
            workplaceTypes,
          });
          await qc.invalidateQueries({ queryKey: ["seeker-profile"] });
          setMessage("Alert preferences saved");
        }}
      >
        Save alerts
      </Button>
    </div>
  );
}
