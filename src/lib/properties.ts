import { z } from "zod";
import raw from "../data/properties.json";
import { PropertySchema, type Property } from "../types/property";
import type { PropertyQuery } from "./property-query";

// Data ek baar load hoke validate hota hai. Kharab data hoga toh turant error aayega.
const ALL_PROPERTIES: Property[] = z.array(PropertySchema).parse(raw);

export interface PropertyListResult {
  items: Property[];
  total: number;
  page: number;
  hasMore: boolean;
}

const sorters: Record<PropertyQuery["sort"], (a: Property, b: Property) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
  price_asc: (a, b) => a.priceLakh - b.priceLakh || a.id - b.id,
  price_desc: (a, b) => b.priceLakh - a.priceLakh || a.id - b.id,
};

export function listProperties(query: PropertyQuery): PropertyListResult {
  const q = query.q?.toLowerCase();

  const filtered = ALL_PROPERTIES.filter((p) => {
    if (q && !`${p.title} ${p.locality}`.toLowerCase().includes(q)) return false;
    if (query.minPrice !== undefined && p.priceLakh < query.minPrice) return false;
    if (query.maxPrice !== undefined && p.priceLakh > query.maxPrice) return false;
    if (query.bhk !== undefined && p.bhk !== query.bhk) return false;
    if (query.type !== undefined && p.type !== query.type) return false;
    if (query.furnished !== undefined && p.furnished !== query.furnished) return false;
    return true;
  });

  filtered.sort(sorters[query.sort]);

  const start = (query.page - 1) * query.limit;
  const items = filtered.slice(start, start + query.limit);

  return {
    items,
    total: filtered.length,
    page: query.page,
    hasMore: start + items.length < filtered.length,
  };
}

export function getPropertyBySlug(slug: string): Property | undefined {
  return ALL_PROPERTIES.find((p) => p.slug === slug);
}

// Similar = same locality ya same BHK (assignment ka rule).
// Dono match karne wali sabse upar, phir sirf locality, phir sirf BHK.
// Barabari par jiska price kareeb ho, wo pehle. Isse order hamesha wahi rehta hai.
export function getSimilarProperties(
  property: Property,
  limit = 4
): Property[] {
  return ALL_PROPERTIES.filter(
    (p) =>
      p.id !== property.id &&
      (p.locality === property.locality || p.bhk === property.bhk)
  )
    .map((p) => ({
      p,
      score:
        (p.locality === property.locality ? 2 : 0) +
        (p.bhk === property.bhk ? 1 : 0),
      priceGap: Math.abs(p.priceLakh - property.priceLakh),
    }))
    .sort((a, b) => b.score - a.score || a.priceGap - b.priceGap || a.p.id - b.p.id)
    .slice(0, limit)
    .map((x) => x.p);
}