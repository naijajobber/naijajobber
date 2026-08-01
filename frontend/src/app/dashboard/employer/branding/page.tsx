"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMyCompany, updateCompany } from "@/lib/jobs-api";

export default function BrandingPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["my-company"], queryFn: getMyCompany });
  const company = q.data?.data;
  const [primaryColor, setPrimary] = useState("#0f766e");
  const [accentColor, setAccent] = useState("#14b8a6");
  const [fontFamily, setFont] = useState("Georgia, serif");
  const [logoUrl, setLogo] = useState("");
  const [coverBannerUrl, setCover] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!company) return;
    setPrimary(company.branding?.primaryColor || "#0f766e");
    setAccent(company.branding?.accentColor || "#14b8a6");
    setFont(company.branding?.fontFamily || "Georgia, serif");
    setLogo(company.logoUrl || "");
    setCover(company.coverBannerUrl || "");
  }, [company]);

  if (q.isLoading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (!company) {
    return (
      <p className="text-sm text-muted">
        Create a company profile before setting branding.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Company Branding
      </h1>
      <p className="text-sm text-muted">
        Colors and assets used on your career page preview.
      </p>
      {message && <p className="text-sm text-accent">{message}</p>}

      <div
        className="rounded-xl border border-border p-6"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}22, ${accentColor}33)`,
          fontFamily,
        }}
      >
        <p className="text-sm font-semibold" style={{ color: primaryColor }}>
          {company.name}
        </p>
        <p className="mt-1 text-xs" style={{ color: accentColor }}>
          Brand preview
        </p>
      </div>

      <Input
        type="color"
        value={primaryColor}
        onChange={(e) => setPrimary(e.target.value)}
        className="h-12 w-24 p-1"
      />
      <p className="text-xs text-muted">Primary</p>
      <Input
        type="color"
        value={accentColor}
        onChange={(e) => setAccent(e.target.value)}
        className="h-12 w-24 p-1"
      />
      <p className="text-xs text-muted">Accent</p>
      <Input
        placeholder="Font family CSS"
        value={fontFamily}
        onChange={(e) => setFont(e.target.value)}
      />
      <Input
        placeholder="Logo URL"
        value={logoUrl}
        onChange={(e) => setLogo(e.target.value)}
      />
      <Input
        placeholder="Cover banner URL"
        value={coverBannerUrl}
        onChange={(e) => setCover(e.target.value)}
      />
      <Button
        onClick={async () => {
          await updateCompany(company._id, {
            logoUrl,
            coverBannerUrl,
            branding: { primaryColor, accentColor, fontFamily },
          });
          await qc.invalidateQueries({ queryKey: ["my-company"] });
          setMessage("Branding saved");
        }}
      >
        Save branding
      </Button>
    </div>
  );
}
