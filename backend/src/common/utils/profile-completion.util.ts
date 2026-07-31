/**
 * Profile completion scoring (mirrors frontend profile-completion.ts).
 * Used for unit tests and any server-side aggregates.
 */
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

export function computeProfileCompletionPercent(
  input: CompletionInput,
): number {
  const hasSkills =
    (input.skills?.length || 0) > 0 || (input.skillItems?.length || 0) > 0;
  const checks = [
    { done: !!input.avatarUrl?.trim(), weight: WEIGHTS.photo },
    {
      done: !!input.bio?.trim() || !!input.headline?.trim(),
      weight: WEIGHTS.bio,
    },
    {
      done: !!input.phone?.trim() || !!input.location?.trim(),
      weight: WEIGHTS.contact,
    },
    { done: hasSkills, weight: WEIGHTS.skills },
    { done: (input.experience?.length || 0) > 0, weight: WEIGHTS.experience },
    { done: (input.education?.length || 0) > 0, weight: WEIGHTS.education },
    {
      done: !!input.cvPdfUrl?.trim() || (input.cvFiles?.length || 0) > 0,
      weight: WEIGHTS.resume,
    },
    { done: (input.languages?.length || 0) > 0, weight: WEIGHTS.languages },
    {
      done: (input.portfolioLinks?.length || 0) > 0,
      weight: WEIGHTS.portfolio,
    },
    {
      done: (input.certificates?.length || 0) > 0,
      weight: WEIGHTS.certifications,
    },
  ];
  const earned = checks.reduce((s, c) => s + (c.done ? c.weight : 0), 0);
  const total = checks.reduce((s, c) => s + c.weight, 0);
  return Math.round((earned / total) * 100);
}
