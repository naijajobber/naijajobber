import Link from "next/link";

const categories = [
  { name: "Web3 & Crypto", href: "/jobs?category=Web3" },
  { name: "Community & Mods", href: "/jobs?category=Community" },
  { name: "Software & Tech", href: "/jobs?category=Software%20Engineering" },
  { name: "Local Gigs", href: "/jobs?category=Local" },
  { name: "Design & Creators", href: "/jobs?category=Design" },
  { name: "Student & Entry", href: "/jobs?category=Entry" },
];

export function TopCategories() {
  return (
    <section id="categories" className="bg-surface/50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Opportunity lanes
        </h2>
        <p className="mt-2 text-muted">
          Local, remote, and Web3 — explore by how African hustlers actually work.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 transition hover:border-accent/40"
            >
              <span className="font-medium">{cat.name}</span>
              <span className="text-sm text-accent">Browse</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
