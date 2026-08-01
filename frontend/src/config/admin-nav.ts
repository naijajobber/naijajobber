export type AdminNavItem = {
  label: string;
  href: string;
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard/admin" }],
  },
  {
    title: "People",
    items: [
      { label: "Users", href: "/dashboard/admin/users" },
      { label: "Employers", href: "/dashboard/admin/employers" },
      { label: "Moderators", href: "/dashboard/admin/moderators" },
      { label: "Roles", href: "/dashboard/admin/roles" },
      { label: "Permissions", href: "/dashboard/admin/permissions" },
    ],
  },
  {
    title: "Companies",
    items: [
      { label: "Companies", href: "/dashboard/admin/companies" },
      { label: "Pending Approvals", href: "/dashboard/admin/approvals" },
      { label: "Employer Verification", href: "/dashboard/admin/verification" },
    ],
  },
  {
    title: "Jobs",
    items: [
      { label: "Job Listings", href: "/dashboard/admin/jobs" },
      { label: "Applications", href: "/dashboard/admin/applications" },
    ],
  },
  {
    title: "Monetization",
    items: [
      { label: "Revenue", href: "/dashboard/admin/revenue" },
      { label: "Subscriptions", href: "/dashboard/admin/subscriptions" },
      { label: "Transactions", href: "/dashboard/admin/transactions" },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Growth Analytics", href: "/dashboard/admin/growth" },
      { label: "Grant Metrics", href: "/dashboard/admin/grants" },
      { label: "Referrals", href: "/dashboard/admin/referrals" },
      { label: "Reports", href: "/dashboard/admin/reports" },
    ],
  },
  {
    title: "Ops",
    items: [
      { label: "Support Tickets", href: "/dashboard/admin/support" },
      { label: "Newsletter", href: "/dashboard/admin/newsletter" },
      { label: "CMS", href: "/dashboard/admin/cms" },
      { label: "Feature Flags", href: "/dashboard/admin/feature-flags" },
      { label: "Fraud Signals", href: "/dashboard/admin/fraud" },
      { label: "AI Ops", href: "/dashboard/admin/ai" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Audit Logs", href: "/dashboard/admin/audit" },
      { label: "Activity Feed", href: "/dashboard/admin/activity" },
      { label: "Platform Health", href: "/dashboard/admin/health" },
      { label: "System Logs", href: "/dashboard/admin/logs" },
      { label: "Settings", href: "/dashboard/admin/settings" },
    ],
  },
];

export const PLATFORM_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MODERATOR",
  "SUPPORT_AGENT",
  "FINANCE_MANAGER",
  "MARKETING_MANAGER",
  "EMPLOYER",
  "RECRUITER",
  "JOB_SEEKER",
] as const;
