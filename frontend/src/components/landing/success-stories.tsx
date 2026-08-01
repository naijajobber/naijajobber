const stories = [
  {
    quote:
      "I landed a fully remote NestJS role in three weeks. The employers were verified and the process felt trustworthy.",
    name: "Chioma A.",
    role: "Backend Engineer · Berlin",
  },
  {
    quote:
      "NaijaJobber helped our team hire two senior designers from Lagos without the usual sourcing chaos.",
    name: "Marcus L.",
    role: "Head of Product · Toronto",
  },
  {
    quote:
      "The AI resume insights helped me rewrite my portfolio and double interview callbacks.",
    name: "Ibrahim K.",
    role: "Product Designer · Accra",
  },
];

export function SuccessStories() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Success stories
        </h2>
        <p className="mt-2 text-muted">Real placements. Real careers.</p>
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
