export default function ListingsSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-8 lg:grid-cols-[18rem_1fr]">
      <div>
        <div className="h-11 animate-pulse rounded-full bg-card lg:hidden" />
        <div className="hidden h-[34rem] animate-pulse rounded-2xl border border-line bg-card lg:block" />
      </div>
      <div>
        <div className="mb-4 h-5 w-24 animate-pulse rounded bg-card" />
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="overflow-hidden rounded-2xl border border-line bg-card"
            >
              <div className="aspect-[3/2] animate-pulse bg-line" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-24 animate-pulse rounded bg-line" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-line" />
                <div className="h-3 w-3/5 animate-pulse rounded bg-line" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-line" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
