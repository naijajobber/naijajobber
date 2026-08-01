"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getPublicProfile } from "@/lib/profiles-api";

export default function TalentPublicPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["talent", params.id],
    queryFn: () => getPublicProfile(params.id),
    enabled: !!params.id,
  });
  const profile = data?.data;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        {isLoading && <p className="text-muted">Loading…</p>}
        {isError && (
          <p className="text-red-500">
            Profile not found or not public.
          </p>
        )}
        {profile && (
          <article>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
              Talent profile
            </h1>
            <p className="mt-2 text-sm text-muted">
              Visibility: {profile.visibility}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.skills?.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-border px-2 py-1 text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
            {!!profile.portfolioLinks?.length && (
              <ul className="mt-6 space-y-1 text-sm">
                {profile.portfolioLinks.map((l) => (
                  <li key={l}>
                    <a
                      href={l}
                      className="text-accent hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </article>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
