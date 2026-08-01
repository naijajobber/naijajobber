export type CompletionInput = {
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  avatarUrl?: string;
  skills?: string[];
  skillItems?: unknown[];
  experience?: unknown[];
  education?: unknown[];
  portfolioLinks?: string[];
  languages?: unknown[];
  certificates?: unknown[];
  cvPdfUrl?: string;
  cvFiles?: unknown[];
};

const WEIGHTS = {
  photo: 8,
  bio: 10,
  contact: 8,
  skills: 12,
  experience: 12,
  education: 10,
  resume: 15,
  languages: 8,
  portfolio: 7,
  certifications: 10,
} as const;

export function computeProfileCompletion(input: CompletionInput): {
  percent: number;
  missing: string[];
  next?: string;
  checks: Array<{ key: string; label: string; done: boolean; weight: number; href: string }>;
} {
  const hasSkills =
    (input.skills?.length || 0) > 0 || (input.skillItems?.length || 0) > 0;
  const checks = [
    {
      key: "photo",
      label: "Profile photo",
      done: !!input.avatarUrl?.trim(),
      weight: WEIGHTS.photo,
      href: "/dashboard/seeker/profile",
    },
    {
      key: "bio",
      label: "Professional summary",
      done: !!input.bio?.trim() || !!input.headline?.trim(),
      weight: WEIGHTS.bio,
      href: "/dashboard/seeker/profile",
    },
    {
      key: "contact",
      label: "Contact details",
      done: !!input.phone?.trim() || !!input.location?.trim(),
      weight: WEIGHTS.contact,
      href: "/dashboard/seeker/profile",
    },
    {
      key: "skills",
      label: "Skills",
      done: hasSkills,
      weight: WEIGHTS.skills,
      href: "/dashboard/seeker/skills",
    },
    {
      key: "experience",
      label: "Experience",
      done: (input.experience?.length || 0) > 0,
      weight: WEIGHTS.experience,
      href: "/dashboard/seeker/experience",
    },
    {
      key: "education",
      label: "Education",
      done: (input.education?.length || 0) > 0,
      weight: WEIGHTS.education,
      href: "/dashboard/seeker/education",
    },
    {
      key: "resume",
      label: "Resume",
      done: !!(input.cvPdfUrl?.trim() || (input.cvFiles?.length || 0) > 0),
      weight: WEIGHTS.resume,
      href: "/dashboard/seeker/profile/cvs",
    },
    {
      key: "languages",
      label: "Languages",
      done: (input.languages?.length || 0) > 0,
      weight: WEIGHTS.languages,
      href: "/dashboard/seeker/languages",
    },
    {
      key: "portfolio",
      label: "Portfolio",
      done: (input.portfolioLinks?.length || 0) > 0,
      weight: WEIGHTS.portfolio,
      href: "/dashboard/seeker/portfolio",
    },
    {
      key: "certifications",
      label: "Certifications",
      done: (input.certificates?.length || 0) > 0,
      weight: WEIGHTS.certifications,
      href: "/dashboard/seeker/certificates",
    },
  ];

  const earned = checks.reduce((sum, c) => sum + (c.done ? c.weight : 0), 0);
  const total = checks.reduce((sum, c) => sum + c.weight, 0);
  const percent = Math.round((earned / total) * 100);
  const missing = checks.filter((c) => !c.done).map((c) => c.label);
  const next = checks.find((c) => !c.done)?.label;

  return { percent, missing, next, checks };
}
