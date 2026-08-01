/** Canonical home path for each platform role. */
export const OPS_ROLES = [
  "MODERATOR",
  "SUPPORT_AGENT",
  "FINANCE_MANAGER",
  "MARKETING_MANAGER",
] as const;

export type OpsRole = (typeof OPS_ROLES)[number];

export function getDashboardPath(role: string | null | undefined): string {
  switch (role) {
    case "JOB_SEEKER":
      return "/dashboard/seeker";
    case "EMPLOYER":
    case "RECRUITER":
      return "/dashboard/employer";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/dashboard/admin";
    case "MODERATOR":
    case "SUPPORT_AGENT":
    case "FINANCE_MANAGER":
    case "MARKETING_MANAGER":
      return "/dashboard/ops";
    default:
      return "/login";
  }
}

export function isAdminRole(role: string | null | undefined) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isEmployerRole(role: string | null | undefined) {
  return role === "EMPLOYER" || role === "RECRUITER";
}

export function isSeekerRole(role: string | null | undefined) {
  return role === "JOB_SEEKER";
}

export function isOpsRole(role: string | null | undefined): role is OpsRole {
  return (
    role === "MODERATOR" ||
    role === "SUPPORT_AGENT" ||
    role === "FINANCE_MANAGER" ||
    role === "MARKETING_MANAGER"
  );
}
