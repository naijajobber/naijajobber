"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  listLearningItems,
  toggleLearningBookmark,
} from "@/lib/seeker-extra-api";
import { getMyProfile } from "@/lib/profiles-api";

export default function LearningPage() {
  const qc = useQueryClient();
  const itemsQ = useQuery({ queryKey: ["learning-items"], queryFn: listLearningItems });
  const profileQ = useQuery({ queryKey: ["seeker-profile"], queryFn: getMyProfile });
  const items = (itemsQ.data?.data as Array<{
    _id: string;
    title: string;
    type: string;
    body: string;
    tags?: string[];
  }> | undefined) || [];
  const bookmarks = profileQ.data?.data?.learningBookmarks || [];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Learning Center
      </h1>
      <p className="mt-1 text-sm text-muted">
        Career articles, resume tips, and remote work guides.
      </p>
      <div className="mt-6 space-y-3">
        {items.map((item) => {
          const bookmarked = bookmarks.includes(item._id);
          return (
            <article
              key={item._id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase text-muted">{item.type}</p>
                  <h2 className="mt-1 font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm text-muted line-clamp-3">{item.body}</p>
                </div>
                <Button
                  size="sm"
                  variant={bookmarked ? "default" : "secondary"}
                  onClick={async () => {
                    await toggleLearningBookmark(item._id);
                    await qc.invalidateQueries({ queryKey: ["seeker-profile"] });
                  }}
                >
                  {bookmarked ? "Saved" : "Bookmark"}
                </Button>
              </div>
            </article>
          );
        })}
        {!items.length && !itemsQ.isLoading && (
          <p className="text-sm text-muted">No learning items yet.</p>
        )}
      </div>
    </div>
  );
}
