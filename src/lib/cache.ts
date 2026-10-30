// Data sirf deploy par badalta hai, isliye read endpoints lambe cache ho sakte hain
export const CACHE_READ =
  "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400";

// Errors aur personal data kabhi cache nahi hone chahiye
export const CACHE_NONE = "no-store";
