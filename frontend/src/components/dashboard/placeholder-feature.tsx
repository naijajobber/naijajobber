export function PlaceholderFeature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <p className="mt-6 rounded-xl border border-dashed border-border bg-card px-4 py-8 text-sm text-muted">
        Coming in a later release.
      </p>
    </div>
  );
}
