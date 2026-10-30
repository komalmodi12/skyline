import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import EmptyState from "@/components/EmptyState";
import Filters from "@/components/Filters";
import ListingsShell from "@/components/ListingsShell";
import ListingsSkeleton from "@/components/ListingsSkeleton";
import Pagination from "@/components/Pagination";
import PropertyCard from "@/components/PropertyCard";
import ScrollMemory from "@/components/ScrollMemory";
import { toQueryString, type FilterState } from "@/lib/filter-options";
import { listProperties } from "@/lib/properties";
import {
  PropertyQuerySchema,
  SORT_OPTIONS,
  parsePropertyQuery,
} from "@/lib/property-query";
import { PROPERTY_TYPES } from "@/types/property";

const DESCRIPTION =
  "Browse apartments, penthouses and villas at Skyline. Filter by price, BHK, type and furnishing.";

export const metadata: Metadata = {
  title: "Homes",
  description: DESCRIPTION,
  // Filter aur page wale saare URLs ek hi asli page ki taraf point karte hain
  alternates: { canonical: "/properties" },
  openGraph: {
    title: "Homes | Skyline",
    description: DESCRIPTION,
    url: "/properties",
    type: "website",
  },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Yeh hissa request ka data (searchParams) padhta hai, isliye Suspense ke andar chalta hai
async function ListingsContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) params.set(key, first);
  }

  // Galat URL par poora page toot'ta nahi: defaults dikhte hain aur ek note aata hai
  const parsed = parsePropertyQuery(params);
  const query = parsed.ok ? parsed.query : PropertyQuerySchema.parse({});
  const result = listProperties(query);

  const state: FilterState = {
    q: query.q ?? "",
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    bhk: query.bhk,
    type: query.type,
    furnished: query.furnished,
    sort: query.sort,
  };

  const totalPages = Math.max(1, Math.ceil(result.total / query.limit));
  const outOfRange = result.total > 0 && result.items.length === 0;
  const start = (result.page - 1) * query.limit + 1;
  const end = start + result.items.length - 1;

  return (
    <>
      {!parsed.ok && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-gold/40 bg-card px-4 py-3 text-sm text-muted"
        >
          Some filters in this link were not valid, so they were ignored.
        </p>
      )}

      <div className="mt-8">
        <ListingsShell
          filters={
            <Filters
              state={state}
              typeOptions={PROPERTY_TYPES}
              sortOptions={SORT_OPTIONS}
            />
          }
        >
          <p aria-live="polite" className="mb-4 text-sm text-muted">
            {result.items.length > 0
              ? `Showing ${start}–${end} of ${result.total} homes`
              : `${result.total} ${result.total === 1 ? "home" : "homes"}`}
          </p>

          {result.total === 0 ? (
            <EmptyState />
          ) : outOfRange ? (
            <div className="rounded-2xl border border-dashed border-line bg-card px-6 py-16 text-center">
              <h2 className="font-serif text-2xl">This page does not exist</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                These filters have only {totalPages}{" "}
                {totalPages === 1 ? "page" : "pages"} of results.
              </p>
              <Link
                href={`/properties${toQueryString(state)}`}
                scroll={false}
                className="mt-6 inline-flex min-h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-navy transition hover:-translate-y-0.5"
              >
                Go to first page
              </Link>
            </div>
          ) : (
            <ScrollMemory>
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((property, i) => (
                  <li key={property.id}>
                    <PropertyCard property={property} priority={i < 3} />
                  </li>
                ))}
              </ul>
              <Pagination
                state={state}
                page={result.page}
                totalPages={totalPages}
              />
            </ScrollMemory>
          )}
        </ListingsShell>
      </div>
    </>
  );
}

export default function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="mx-auto max-w-7xl px-[5vw] py-10">
      <h1 className="font-serif text-4xl">Homes at Skyline</h1>
      <p className="mt-2 text-muted">
        Apartments, penthouses and villas across eight localities.
      </p>

      <Suspense
        fallback={
          <div className="mt-8">
            <ListingsSkeleton />
          </div>
        }
      >
        <ListingsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
