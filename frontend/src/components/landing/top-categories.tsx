import Link from "next/link";

const categories = [
  { name: "Software Engineering", count: 1280 },
  { name: "Product & Design", count: 540 },
  { name: "Data & AI", count: 410 },
  { name: "Marketing", count: 320 },
  { name: "Customer Success", count: 290 },
  { name: "Finance & Ops", count: 180 },
];

export function TopCategories() {
  return (
    <section id="categories" className="bg-surface/50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Top categories
        </h2>
        <p className="mt-2 text-muted">Explore roles by discipline.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href="/jobs"
              className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 transition hover:border-accent/40"
            >
              <span className="font-medium">{cat.name}</span>
              <span className="text-sm text-muted">{cat.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
