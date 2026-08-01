"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getMyProfile,
  updateMyProfile,
  type LanguageItem,
} from "@/lib/profiles-api";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Native", "Fluent"];

export default function LanguagesPage() {
  const qc = useQueryClient();
  const profileQ = useQuery({ queryKey: ["seeker-profile"], queryFn: getMyProfile });
  const languages = profileQ.data?.data?.languages ?? [];
  const [draft, setDraft] = useState<LanguageItem>({
    language: "",
    speaking: "Intermediate",
    writing: "Intermediate",
    reading: "Intermediate",
    listening: "Intermediate",
  });
  const [error, setError] = useState<string | null>(null);

  const save = async (next: LanguageItem[]) => {
    setError(null);
    try {
      await updateMyProfile({ languages: next });
      await qc.invalidateQueries({ queryKey: ["seeker-profile"] });
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save",
      );
    }
  };

  if (profileQ.isLoading) {
    return <p className="text-sm text-muted">Loading languages…</p>;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Languages
        </h1>
        <p className="mt-1 text-sm text-muted">
          Add languages and proficiency across speaking, writing, reading, and listening.
        </p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-2">
        {languages.map((lang, idx) => (
          <div
            key={`${lang.language}-${idx}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium">{lang.language}</p>
              <p className="text-xs text-muted">
                Speak {lang.speaking} · Write {lang.writing} · Read {lang.reading} ·
                Listen {lang.listening}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => save(languages.filter((_, i) => i !== idx))}
            >
              Remove
            </Button>
          </div>
        ))}
        {languages.length === 0 && (
          <p className="text-sm text-muted">No languages yet.</p>
        )}
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <Input
          placeholder="Language"
          value={draft.language || ""}
          onChange={(e) => setDraft({ ...draft, language: e.target.value })}
        />
        {(["speaking", "writing", "reading", "listening"] as const).map((key) => (
          <label key={key} className="block text-xs text-muted">
            {key}
            <select
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={draft[key] || "Intermediate"}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        ))}
        <Button
          onClick={() => {
            if (!draft.language?.trim()) return;
            void save([...languages, draft]);
            setDraft({
              language: "",
              speaking: "Intermediate",
              writing: "Intermediate",
              reading: "Intermediate",
              listening: "Intermediate",
            });
          }}
        >
          Add language
        </Button>
      </div>
    </div>
  );
}
