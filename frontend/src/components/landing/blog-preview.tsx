const posts = [
  {
    title: "How African engineers are winning global remote roles",
    date: "Jul 2, 2026",
    excerpt: "A practical playbook for profiles, portfolios, and interview prep.",
  },
  {
    title: "What verified employers look for in 2026",
    date: "Jun 18, 2026",
    excerpt: "Signals that separate strong applicants from the rest of the pile.",
  },
  {
    title: "Building an AI-ready resume without keyword stuffing",
    date: "Jun 1, 2026",
    excerpt: "Use AI to clarify impact — not invent experience.",
  },
];

export function BlogPreview() {
  return (
    <section className="bg-surface/50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          From the blog
        </h2>
        <p className="mt-2 text-muted">Career insights and hiring trends.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <p className="text-xs text-muted">{post.date}</p>
              <h3 className="mt-2 text-lg font-semibold leading-snug">
                {post.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
