import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
        NaijaJobber
      </p>
      <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="text-slate-600">
        That route does not exist, or the link is outdated.
      </p>
      <Link
        href="/"
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
      >
        Go home
      </Link>
    </main>
  );
}
