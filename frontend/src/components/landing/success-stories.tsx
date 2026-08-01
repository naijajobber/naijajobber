const stories = [
  {
    quote:
      "I used to miss roles because information moved too fast on Telegram. NaijaJobber feels like the same hustle — with clearer, verified drops.",
    name: "Adaeze O.",
    role: "Community moderator · Lagos",
  },
  {
    quote:
      "We needed credible African talent without building a full HR stack. The community-to-platform speed is what stood out.",
    name: "Kelechi M.",
    role: "Project lead · Remote",
  },
  {
    quote:
      "You don’t need a degree to break in — you need access, hustle, and guidance. That’s the energy here.",
    name: "Tunde B.",
    role: "Web3 builder · Abuja",
  },
];

export function SuccessStories() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          From the community
        </h2>
        <p className="mt-2 text-muted">
          Real hustlers. Real access. From hustle to hire.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {stories.map((story) => (
            <blockquote
              key={story.name}
              className="rounded-xl border border-border bg-card p-6"
            >
              <p className="text-sm leading-relaxed text-foreground/90">
                “{story.quote}”
              </p>
              <footer className="mt-5">
                <p className="text-sm font-semibold">{story.name}</p>
                <p className="text-xs text-muted">{story.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
