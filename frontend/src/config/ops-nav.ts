export type OpsNavItem = {
  label: string;
  href: string;
};

export type OpsNavGroup = {
  title: string;
  items: OpsNavItem[];
};

/** Full ops catalog; filtered per role via getOpsNavForRole. */
export const OPS_NAV_CATALOG: OpsNavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard/ops" }],
  },
  {
    title: "Moderation",
    items: [
      { label: "Companies", href: "/dashboard/ops/companies" },
      { label: "Approvals", href: "/dashboard/ops/approvals" },
      { label: "Verification", href: "/dashboard/ops/verification" },
      { label: "Jobs", href: "/dashboard/ops/jobs" },
      { label: "Applications", href: "/dashboard/ops/applications" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Support Tickets", href: "/dashboard/ops/support" },
      { label: "Users", href: "/dashboard/ops/users" },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Revenue", href: "/dashboard/ops/revenue" },
      { label: "Transactions", href: "/dashboard/ops/transactions" },
      { label: "Subscriptions", href: "/dashboard/ops/subscriptions" },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Newsletter", href: "/dashboard/ops/newsletter" },
      { label: "CMS", href: "/dashboard/ops/cms" },
      { label: "Referrals", href: "/dashboard/ops/referrals" },
      { label: "Growth", href: "/dashboard/ops/growth" },
    ],
  },
  {
    title: "Workspace",
    items: [{ label: "Messages", href: "/dashboard/ops/messages" }],
  },
];

const ROLE_HREFS: Record<string, string[]> = {
  MODERATOR: [
    "/dashboard/ops",
    "/dashboard/ops/companies",
    "/dashboard/ops/approvals",
    "/dashboard/ops/verification",
    "/dashboard/ops/jobs",
    "/dashboard/ops/applications",
    "/dashboard/ops/messages",
  ],
  SUPPORT_AGENT: [
    "/dashboard/ops",
    "/dashboard/ops/support",
    "/dashboard/ops/users",
    "/dashboard/ops/messages",
  ],
  FINANCE_MANAGER: [
    "/dashboard/ops",
    "/dashboard/ops/revenue",
    "/dashboard/ops/transactions",
    "/dashboard/ops/subscriptions",
    "/dashboard/ops/approvals",
  ],
  MARKETING_MANAGER: [
    "/dashboard/ops",
    "/dashboard/ops/newsletter",
    "/dashboard/ops/cms",
    "/dashboard/ops/referrals",
    "/dashboard/ops/growth",
  ],
};

export function getOpsAllowedHrefs(role: string | null | undefined): string[] {
  if (!role) return ["/dashboard/ops"];
  return ROLE_HREFS[role] ?? ["/dashboard/ops"];
}

export function isOpsHrefAllowed(
  role: string | null | undefined,
  pathname: string,
): boolean {
  const allowed = getOpsAllowedHrefs(role);
  if (allowed.includes(pathname)) return true;
  // Allow trailing path segments only for exact catalog matches
  return allowed.some(
    (href) => href !== "/dashboard/ops" && pathname.startsWith(`${href}/`),
  );
}

export function getOpsNavForRole(role: string | null | undefined): OpsNavGroup[] {
  const allowed = new Set(getOpsAllowedHrefs(role));
  return OPS_NAV_CATALOG.map((group) => ({
    ...group,
    items: group.items.filter((item) => allowed.has(item.href)),
  })).filter((group) => group.items.length > 0);
}
