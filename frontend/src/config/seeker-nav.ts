export type SeekerNavItem = {
  label: string;
  href: string;
};

export type SeekerNavGroup = {
  title: string;
  items: SeekerNavItem[];
};

export const SEEKER_NAV: SeekerNavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard/seeker" }],
  },
  {
    title: "Profile",
    items: [
      { label: "Complete Profile", href: "/dashboard/seeker/profile" },
      { label: "Profile Completion", href: "/dashboard/seeker/profile/completion" },
      { label: "Upload CVs", href: "/dashboard/seeker/profile/cvs" },
      { label: "Resume Builder", href: "/dashboard/seeker/resume/builder" },
      { label: "Resume Parser", href: "/dashboard/seeker/resume/parser" },
      { label: "Portfolio", href: "/dashboard/seeker/portfolio" },
      { label: "Experience", href: "/dashboard/seeker/experience" },
      { label: "Education", href: "/dashboard/seeker/education" },
      { label: "Skills", href: "/dashboard/seeker/skills" },
      { label: "Languages", href: "/dashboard/seeker/languages" },
      { label: "Certificates", href: "/dashboard/seeker/certificates" },
    ],
  },
  {
    title: "Jobs",
    items: [
      { label: "Saved Jobs", href: "/dashboard/seeker/jobs/saved" },
      { label: "Applied Jobs", href: "/dashboard/seeker/jobs/applied" },
      { label: "Application Tracker", href: "/dashboard/seeker/applications" },
      { label: "Interview Schedule", href: "/dashboard/seeker/interviews" },
      { label: "Job Alerts", href: "/dashboard/seeker/alerts" },
    ],
  },
  {
    title: "Career",
    items: [
      { label: "Availability Status", href: "/dashboard/seeker/availability" },
      { label: "Career Goals", href: "/dashboard/seeker/goals" },
      { label: "Career Insights", href: "/dashboard/seeker/insights" },
      { label: "Learning Center", href: "/dashboard/seeker/learning" },
    ],
  },
  {
    title: "AI Tools",
    items: [
      { label: "AI Resume Analysis", href: "/dashboard/seeker/ai/resume" },
      { label: "AI Cover Letter", href: "/dashboard/seeker/ai/cover-letter" },
      { label: "AI Job Match", href: "/dashboard/seeker/ai/match" },
    ],
  },
  {
    title: "Engage",
    items: [
      { label: "Notifications", href: "/dashboard/seeker/notifications" },
      { label: "Messages", href: "/dashboard/seeker/messages" },
      { label: "Referral Dashboard", href: "/dashboard/seeker/referrals" },
      { label: "Wallet", href: "/dashboard/seeker/wallet" },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Settings", href: "/dashboard/seeker/settings" }],
  },
];
