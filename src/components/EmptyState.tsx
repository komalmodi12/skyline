import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-card px-6 py-16 text-center">
      <h2 className="font-serif text-2xl">No homes match your filters</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
        Try a different search, widen the price range, or clear the filters to
        see every home.
      </p>
      <Link
        href="/properties"
        scroll={false}
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-navy transition hover:-translate-y-0.5"
      >
        Clear all filters
      </Link>
    </div>
  );
}
