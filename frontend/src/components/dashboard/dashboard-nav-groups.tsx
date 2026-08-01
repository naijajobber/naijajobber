"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardNavItem = {
  label: string;
  href: string;
};

export type DashboardNavGroup = {
  title: string;
  items: DashboardNavItem[];
};

function groupContainsPath(group: DashboardNavGroup, pathname: string) {
  return group.items.some((item) => pathname === item.href);
}

export function DashboardNavGroups({
  groups,
  onNavigate,
}: {
  groups: DashboardNavGroup[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [openTitles, setOpenTitles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of groups) {
      initial[group.title] = groupContainsPath(group, pathname);
    }
    // Always open the first group if nothing matches (e.g. home that is alone in Overview)
    if (!Object.values(initial).some(Boolean) && groups[0]) {
      initial[groups[0].title] = true;
    }
    return initial;
  });

  useEffect(() => {
    setOpenTitles((prev) => {
      const next = { ...prev };
      for (const group of groups) {
        if (groupContainsPath(group, pathname)) {
          next[group.title] = true;
        }
      }
      return next;
    });
  }, [pathname, groups]);

  const toggle = (title: string) => {
    setOpenTitles((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="space-y-1">
      {groups.map((group) => {
        const expanded = !!openTitles[group.title];
        const hasActive = groupContainsPath(group, pathname);

        return (
          <div key={group.title} className="rounded-md">
            <button
              type="button"
              onClick={() => toggle(group.title)}
              aria-expanded={expanded}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide transition-colors",
                hasActive
                  ? "bg-surface text-accent"
                  : "text-muted hover:bg-surface hover:text-foreground",
              )}
            >
              <span>{group.title}</span>
              <ChevronDown
                size={14}
                className={cn(
                  "shrink-0 transition-transform duration-200",
                  expanded ? "rotate-0" : "-rotate-90",
                )}
              />
            </button>
            {expanded && (
              <ul className="mt-0.5 space-y-0.5 pb-2 pl-1">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "block cursor-pointer rounded-md px-2 py-1.5 text-sm transition-colors",
                          active
                            ? "bg-surface text-accent"
                            : "text-foreground/85 hover:bg-surface hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
