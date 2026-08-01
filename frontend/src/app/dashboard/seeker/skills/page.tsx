"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getMyProfile,
  updateMyProfile,
  type SkillItem,
} from "@/lib/profiles-api";

const CATEGORIES = [
  "Programming",
  "Marketing",
  "Design",
  "Writing",
  "Management",
  "Cloud",
  "AI",
  "Blockchain",
  "General",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

export default function SkillsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["seeker-profile"], queryFn: getMyProfile });
  const skillItems = q.data?.data?.skillItems?.length
    ? q.data.data.skillItems
    : (q.data?.data?.skills || []).map((name) => ({
        name,
        category: "General",
        level: "Intermediate",
      }));
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<SkillItem>({
    name: "",
    category: "Programming",
    level: "Intermediate",
  });

  const filtered = skillItems.filter((s) =>
    (s.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  const save = async (next: SkillItem[]) => {
    await updateMyProfile({
      skillItems: next,
      skills: next.map((s) => s.name || "").filter(Boolean),
    });
    await qc.invalidateQueries({ queryKey: ["seeker-profile"] });
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Skills
      </h1>
      <p className="text-sm text-muted">
        Categorize and rate skills from Beginner to Expert.
      </p>
      <Input
        placeholder="Search skills"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="space-y-2">
        {filtered.map((s, idx) => (
          <div
            key={`${s.name}-${idx}`}
            className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-xs text-muted">
                {s.category} · {s.level}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                save(skillItems.filter((_, i) => i !== idx))
              }
            >
              Remove
            </Button>
          </div>
        ))}
        {!filtered.length && (
          <p className="text-sm text-muted">No skills yet.</p>
        )}
      </div>
      <div className="space-y-2 rounded-xl border border-border bg-card p-4">
        <Input
          placeholder="Skill name"
          value={draft.name || ""}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <select
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={draft.category}
          onChange={(e) => setDraft({ ...draft, category: e.target.value })}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={draft.level}
          onChange={(e) => setDraft({ ...draft, level: e.target.value })}
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <Button
          onClick={() => {
            if (!draft.name?.trim()) return;
            void save([...skillItems, draft]);
            setDraft({ name: "", category: "Programming", level: "Intermediate" });
          }}
        >
          Add skill
        </Button>
      </div>
    </div>
  );
}
