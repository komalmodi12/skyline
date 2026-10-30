import Link from "next/link";

export default function Home() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-[5vw] py-24">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Skyline</p>
      <h1 className="font-serif text-5xl leading-tight sm:text-6xl">
        Live above the skyline.
      </h1>
      <p className="max-w-md text-muted">
        62 floors of residences. The 3D story arrives in a later step.
      </p>
      <Link
        href="/properties"
        className="inline-flex min-h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-navy transition hover:-translate-y-0.5"
      >
        Explore homes
      </Link>
    </section>
  );
}
