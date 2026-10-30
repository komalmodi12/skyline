// Is file ko client aur server dono use karte hain.
// Yahan zod import mat karna, warna browser ka JS bhaari ho jaata hai.

export const PRICE_STEPS: number[] = [50, 100, 200, 300, 500, 1000, 2000]; // ₹ lakh
export const BHK_OPTIONS = [1, 2, 3, 4] as const;

export const SORT_LABELS: Record<string, string> = {
  newest: "Newest",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
};

export interface FilterState {
  q: string;
  minPrice?: number;
  maxPrice?: number;
  bhk?: number;
  type?: string;
  furnished?: boolean;
  sort: string;
}

export function priceLabel(lakh: number) {
  return lakh >= 100 ? `₹${lakh / 100} Cr` : `₹${lakh} L`;
}

// Filters se URL ka query string banata hai. Page jaan-boojhkar nahi hai:
// filter badalne par page hamesha 1 par wapas jaata hai.
export function toQueryString(s: FilterState) {
  const p = new URLSearchParams();
  const q = s.q.trim();
  if (q) p.set("q", q);
  if (s.minPrice !== undefined) p.set("minPrice", String(s.minPrice));
  if (s.maxPrice !== undefined) p.set("maxPrice", String(s.maxPrice));
  if (s.bhk !== undefined) p.set("bhk", String(s.bhk));
  if (s.type) p.set("type", s.type);
  if (s.furnished !== undefined) p.set("furnished", String(s.furnished));
  if (s.sort !== "newest") p.set("sort", s.sort);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export function hasActiveFilters(s: FilterState) {
  return (
    s.q.trim() !== "" ||
    s.minPrice !== undefined ||
    s.maxPrice !== undefined ||
    s.bhk !== undefined ||
    s.type !== undefined ||
    s.furnished !== undefined
  );
}
