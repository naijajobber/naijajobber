"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMyCompany, updateCompany } from "@/lib/jobs-api";

export default function CareerPageBuilder() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["my-company"], queryFn: getMyCompany });
  const company = q.data?.data;
  const [story, setStory] = useState("");
  const [cultureBlurb, setCulture] = useState("");
  const [benefits, setBenefits] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDesc] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const c = company?.careerPage;
    if (c) {
      setStory(c.story || "");
      setCulture(c.cultureBlurb || "");
      setBenefits((c.benefits || []).join("\n"));
      setSeoTitle(c.seoTitle || "");
      setSeoDesc(c.seoDescription || "");
    }
  }, [company]);

  if (!company) {
    return (
      <p className="text-sm text-muted">
        Create a company first.{" "}
        <Link href="/dashboard/employer/company" className="text-accent">
          Company profile
        </Link>
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            Career page
          </h1>
          <p className="mt-1 text-sm text-muted">
            Public story, culture, benefits, and SEO for open roles.
          </p>
        </div>
        <Link
          href={`/companies/${company.slug}`}
          className="text-sm text-accent hover:underline"
        >
          Preview
        </Link>
      </div>
      {message && <p className="text-sm text-accent">{message}</p>}
      <textarea
        className="min-h-28 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        placeholder="Company story"
        value={story}
        onChange={(e) => setStory(e.target.value)}
      />
      <textarea
        className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        placeholder="Culture"
        value={cultureBlurb}
        onChange={(e) => setCulture(e.target.value)}
      />
      <textarea
        className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        placeholder="Benefits (one per line)"
        value={benefits}
        onChange={(e) => setBenefits(e.target.value)}
      />
      <Input
        placeholder="SEO title"
        value={seoTitle}
        onChange={(e) => setSeoTitle(e.target.value)}
      />
      <Input
        placeholder="SEO description"
        value={seoDescription}
        onChange={(e) => setSeoDesc(e.target.value)}
      />
      <Button
        onClick={async () => {
          await updateCompany(company._id, {
            careerPage: {
              story,
              cultureBlurb,
              benefits: benefits
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
              seoTitle,
              seoDescription,
            },
          });
          await qc.invalidateQueries({ queryKey: ["my-company"] });
          setMessage("Career page saved");
        }}
      >
        Save career page
      </Button>
    </div>
  );
}
