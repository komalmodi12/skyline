import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-[5vw] py-24">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Error 404</p>
      <h1 className="font-serif text-4xl">We could not find that page</h1>
      <p className="max-w-md text-muted">
        The home may have been removed, or the link may be wrong.
      </p>
      <Link
        href="/properties"
        className="mt-2 inline-flex min-h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-navy transition hover:-translate-y-0.5"
      >
        Browse all homes
      </Link>
    </section>
  );
}
