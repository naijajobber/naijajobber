"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addTalentCandidate,
  listTalentPool,
  removeTalentCandidate,
  updateTalentCandidate,
} from "@/lib/employer-api";

const FOLDERS = [
  "Engineering",
  "Marketing",
  "Sales",
  "Design",
  "Management",
];

export default function TalentPoolPage() {
  const qc = useQueryClient();
  const [folder, setFolder] = useState("");
  const q = useQuery({
    queryKey: ["talent-pool", folder],
    queryFn: () => listTalentPool(folder ? { folder } : undefined),
  });
  const items =
    (q.data?.data as Array<{
      _id: string;
      seekerUserId: string;
      folder?: string;
      tags?: string[];
      notes?: string;
      rating?: number;
    }> | undefined) || [];
  const [seekerUserId, setSeeker] = useState("");
  const [newFolder, setNewFolder] = useState("Engineering");

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Talent pool
      </h1>
      <p className="text-sm text-muted">
        Save candidates in folders with tags, notes, and ratings.
      </p>
      <select
        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
        value={folder}
        onChange={(e) => setFolder(e.target.value)}
      >
        <option value="">All folders</option>
        {FOLDERS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Seeker user id"
          value={seekerUserId}
          onChange={(e) => setSeeker(e.target.value)}
        />
        <select
          className="h-10 rounded-md border border-border bg-background px-2 text-sm"
          value={newFolder}
          onChange={(e) => setNewFolder(e.target.value)}
        >
          {FOLDERS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <Button
          onClick={async () => {
            await addTalentCandidate({
              seekerUserId,
              folder: newFolder,
              tags: [],
              notes: "",
              rating: 3,
            });
            setSeeker("");
            await qc.invalidateQueries({ queryKey: ["talent-pool"] });
          }}
        >
          Add
        </Button>
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item._id}
            className="rounded-xl border border-border px-3 py-3 text-sm"
          >
            <p className="font-medium">{item.seekerUserId}</p>
            <p className="text-xs text-muted">
              {item.folder} · rating {item.rating ?? "—"}
            </p>
            <Input
              className="mt-2"
              placeholder="Notes"
              defaultValue={item.notes || ""}
              onBlur={async (e) => {
                await updateTalentCandidate(item._id, {
                  notes: e.target.value,
                });
              }}
            />
            <Button
              className="mt-2"
              size="sm"
              variant="ghost"
              onClick={async () => {
                await removeTalentCandidate(item._id);
                await qc.invalidateQueries({ queryKey: ["talent-pool"] });
              }}
            >
              Remove
            </Button>
          </li>
        ))}
        {!items.length && (
          <li className="text-sm text-muted">No saved candidates yet.</li>
        )}
      </ul>
    </div>
  );
}
