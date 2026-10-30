import Link from "next/link";
import { toQueryString, type FilterState } from "@/lib/filter-options";

// 1 ... 4 5 6 ... 12 jaisi list banata hai
function pageList(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = [1, total, current - 1, current, current + 1]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const unique = [...new Set(wanted)];
  const out: (number | "gap")[] = [];
  unique.forEach((p, i) => {
    if (i > 0 && p - unique[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

const base =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm transition-colors";

export default function Pagination({
  state,
  page,
  totalPages,
}: {
  state: FilterState;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => `/properties${toQueryString(state, p)}`;

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          rel="prev"
          className={`${base} border-line hover:border-gold`}
        >
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={`${base} border-line opacity-40`}>
          Previous
        </span>
      )}

      {pageList(page, totalPages).map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-muted">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={href(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={`${base} ${
              item === page
                ? "border-gold bg-gold font-semibold text-navy"
                : "border-line hover:border-gold"
            }`}
          >
            {item}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link
          href={href(page + 1)}
          rel="next"
          className={`${base} border-line hover:border-gold`}
        >
          Next
        </Link>
      ) : (
        <span aria-disabled="true" className={`${base} border-line opacity-40`}>
          Next
        </span>
      )}
    </nav>
  );
}
