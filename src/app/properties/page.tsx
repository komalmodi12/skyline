import type { Metadata } from "next";
import { Suspense } from "react";
import Filters from "@/components/Filters";
import ListingsShell from "@/components/ListingsShell";
import ListingsSkeleton from "@/components/ListingsSkeleton";
import PropertyCard from "@/components/PropertyCard";
import type { FilterState } from "@/lib/filter-options";
import { listProperties } from "@/lib/properties";
import {
  PropertyQuerySchema,
  SORT_OPTIONS,
  parsePropertyQuery,
} from "@/lib/property-query";
import { PROPERTY_TYPES } from "@/types/property";

export const metadata: Metadata = {
  title: "Homes",
  description:
    "Browse apartments, penthouses and villas at Skyline. Filter by price, BHK, type and furnishing.",
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
            {result.total} {result.total === 1 ? "home" : "homes"}
          </p>
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {result.items.map((property, i) => (
              <li key={property.id}>
                <PropertyCard property={property} priority={i < 3} />
              </li>
            ))}
          </ul>
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
