export type EmployerNavItem = {
  label: string;
  href: string;
};

export type EmployerNavGroup = {
  title: string;
  items: EmployerNavItem[];
};

export const EMPLOYER_NAV: EmployerNavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard/employer" }],
  },
  {
    title: "Company",
    items: [
      { label: "Company Profile", href: "/dashboard/employer/company" },
      {
        label: "Company Verification",
        href: "/dashboard/employer/company/verification",
      },
      { label: "Team Members", href: "/dashboard/employer/team" },
      { label: "Company Branding", href: "/dashboard/employer/branding" },
      { label: "Career Page", href: "/dashboard/employer/career-page" },
    ],
  },
  {
    title: "Jobs",
    items: [
      { label: "Post Jobs", href: "/dashboard/employer/jobs/new" },
      { label: "All Jobs", href: "/dashboard/employer/jobs" },
      { label: "Draft Jobs", href: "/dashboard/employer/jobs/drafts" },
      { label: "Featured Jobs", href: "/dashboard/employer/jobs/featured" },
      { label: "Sponsored Jobs", href: "/dashboard/employer/jobs/sponsored" },
    ],
  },
  {
    title: "Hiring",
    items: [
      { label: "Manage Applicants", href: "/dashboard/employer/applicants" },
      { label: "Hiring Pipeline", href: "/dashboard/employer/pipeline" },
      {
        label: "Interview Scheduling",
        href: "/dashboard/employer/interviews",
      },
      { label: "Talent Pool", href: "/dashboard/employer/talent" },
      { label: "Assessments", href: "/dashboard/employer/assessments" },
      { label: "Offers", href: "/dashboard/employer/offers" },
    ],
  },
  {
    title: "Engage",
    items: [
      { label: "Messaging", href: "/dashboard/employer/messages" },
      { label: "Support", href: "/dashboard/employer/support" },
    ],
  },
  {
    title: "Insights",
    items: [{ label: "Analytics", href: "/dashboard/employer/analytics" }],
  },
  {
    title: "Billing",
    items: [
      { label: "Subscription Plans", href: "/dashboard/employer/billing" },
      { label: "Invoices", href: "/dashboard/employer/billing/invoices" },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Settings", href: "/dashboard/employer/settings" }],
  },
];
