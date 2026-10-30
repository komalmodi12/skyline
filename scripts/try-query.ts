import { parsePropertyQuery } from "../src/lib/property-query";
import { listProperties } from "../src/lib/properties";

function run(label: string, qs: string) {
  const parsed = parsePropertyQuery(new URLSearchParams(qs));
  if (!parsed.ok) {
    console.log(`${label} → INVALID`, parsed.errors);
    return;
  }
  const r = listProperties(parsed.query);
  console.log(
    `${label} → total ${r.total}, page ${r.page}, items ${r.items.length}, hasMore ${r.hasMore}`
  );
  return r;
}

run("default", "");
run("3 BHK", "bhk=3");
run("search powai", "q=powai");
run("furnished villas", "type=Villa&furnished=true");
run("page 5", "page=5");
run("page 6 (out of range)", "page=6");
run("limit 25", "limit=25");
run("bhk 9", "bhk=9");
run("min > max", "minPrice=500&maxPrice=100");

const asc = run("price asc", "sort=price_asc&limit=5");
console.log("  prices:", asc?.items.map((p) => p.priceLakh));
const desc = run("price desc", "sort=price_desc&limit=5");
console.log("  prices:", desc?.items.map((p) => p.priceLakh));