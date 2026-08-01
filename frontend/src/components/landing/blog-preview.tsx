const posts = [
  {
    title: "From Telegram drops to a TalentTech revolution",
    date: "Jul 2, 2026",
    excerpt:
      "Why information — not talent — is the real gap between searching and getting hired.",
  },
  {
    title: "Local, remote, and Web3: one opportunity engine",
    date: "Jun 18, 2026",
    excerpt:
      "How NaijaJobber serves job seekers, students, and builders in one place.",
  },
  {
    title: "You don’t need a degree to break in",
    date: "Jun 1, 2026",
    excerpt:
      "Access, preparation, and guidance — practical paths for people who grind smart.",
  },
];

export function BlogPreview() {
  return (
    <section className="bg-surface/50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          From the opportunity desk
        </h2>
        <p className="mt-2 text-muted">
          Career access, community lessons, and opportunity culture.
        </p>
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
