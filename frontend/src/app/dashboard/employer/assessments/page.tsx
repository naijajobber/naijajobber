"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createAssessment,
  listAssessments,
  sendAssessment,
} from "@/lib/employer-api";

export default function AssessmentsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["assessments"], queryFn: listAssessments });
  const items =
    (q.data?.data as Array<{
      _id: string;
      title: string;
      type?: string;
      questions?: unknown[];
    }> | undefined) || [];
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [applicationId, setAppId] = useState("");

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Assessments
      </h1>
      <p className="text-sm text-muted">
        MCQ / essay assessments with mock auto-scoring.
      </p>
      <Input
        placeholder="Assessment title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        placeholder="Question prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <Button
        onClick={async () => {
          await createAssessment({
            title,
            type: "ESSAY",
            questions: [
              {
                id: "q1",
                prompt,
                type: "essay",
                options: [],
                correctIndex: null,
              },
            ],
          });
          setTitle("");
          setPrompt("");
          await qc.invalidateQueries({ queryKey: ["assessments"] });
        }}
      >
        Create
      </Button>

      <ul className="space-y-3">
        {items.map((a) => (
          <li
            key={a._id}
            className="rounded-xl border border-border p-3 text-sm"
          >
            <p className="font-medium">{a.title}</p>
            <p className="text-xs text-muted">{a.type}</p>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Application id to send"
                value={applicationId}
                onChange={(e) => setAppId(e.target.value)}
              />
              <Button
                size="sm"
                onClick={async () => {
                  await sendAssessment(a._id, applicationId);
                }}
              >
                Send
              </Button>
            </div>
          </li>
        ))}
        {!items.length && (
          <li className="text-sm text-muted">No assessments yet.</li>
        )}
      </ul>
    </div>
  );
}
