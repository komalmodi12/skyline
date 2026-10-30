import { mkdirSync, writeFileSync } from "node:fs";
import { PropertySchema, type Property } from "../src/types/property";

// Seeded random: har baar chalane par wahi data banta hai
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(2026);
const int = (min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;
const pick = <T>(arr: readonly T[]) => arr[int(0, arr.length - 1)];

// rate = ₹ per sq ft (andaazan)
const AREAS = [
  { locality: "Sector 150", city: "Noida", rate: 9000 },
  { locality: "Sector 137", city: "Noida", rate: 7000 },
  { locality: "Golf Course Road", city: "Gurugram", rate: 16000 },
  { locality: "Whitefield", city: "Bengaluru", rate: 9500 },
  { locality: "Bandra West", city: "Mumbai", rate: 38000 },
  { locality: "Powai", city: "Mumbai", rate: 22000 },
  { locality: "Koregaon Park", city: "Pune", rate: 14000 },
  { locality: "Jubilee Hills", city: "Hyderabad", rate: 13000 },
];

const AMENITIES = [
  "Infinity pool",
  "Sky gym",
  "Terrace garden",
  "Clubhouse",
  "EV charging",
  "24x7 security",
  "Co-working lounge",
  "Kids play area",
];

const AREA_RANGE: Record<number, [number, number]> = {
  1: [550, 750],
  2: [900, 1300],
  3: [1400, 1900],
  4: [2100, 3000],
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const COUNT = 60;
const BASE_DATE = Date.UTC(2026, 9, 24);
const DAY = 24 * 60 * 60 * 1000;

const properties: Property[] = [];

for (let id = 1; id <= COUNT; id++) {
  const place = pick(AREAS);
  const bhk = int(1, 4);
  const type =
    id % 5 === 0 ? "Penthouse" : id % 7 === 0 ? "Villa" : "Apartment";

  const [minA, maxA] = AREA_RANGE[bhk];
  let areaSqFt = int(minA, maxA);
  if (type === "Penthouse") areaSqFt = Math.round(areaSqFt * 1.25);
  if (type === "Villa") areaSqFt = Math.round(areaSqFt * 1.4);

  const multiplier = type === "Penthouse" ? 1.5 : type === "Villa" ? 1.3 : 1;
  const priceLakh = Math.round((areaSqFt * place.rate * multiplier) / 100000);

  const amenities = [...AMENITIES]
    .sort(() => rand() - 0.5)
    .slice(0, int(4, 7));

  const title = `${bhk} BHK ${type} in ${place.locality}`;
  const first = int(1, 8);
  const images = [0, 1, 2, 3].map(
    (v) => `/images/homes/home-${((first + v - 1) % 8) + 1}.webp`
  );

  properties.push(
    PropertySchema.parse({
      id,
      slug: `${slugify(title)}-${id}`,
      title,
      locality: place.locality,
      city: place.city,
      priceLakh,
      bhk,
      type,
      areaSqFt,
      furnished: rand() < 0.6,
      amenities,
      images,
      description: `A ${areaSqFt} sq ft ${bhk} BHK ${type.toLowerCase()} in ${place.locality}, ${place.city}, with access to ${amenities.slice(0, 3).join(", ").toLowerCase()} at the Skyline tower.`,
      createdAt: new Date(BASE_DATE - id * 2 * DAY).toISOString(),
    })
  );
}

mkdirSync("src/data", { recursive: true });
writeFileSync("src/data/properties.json", JSON.stringify(properties, null, 2));

const count = (f: (p: Property) => string) =>
  properties.reduce<Record<string, number>>((acc, p) => {
    acc[f(p)] = (acc[f(p)] ?? 0) + 1;
    return acc;
  }, {});
console.log(`Wrote ${properties.length} properties`);
console.log("By BHK:", count((p) => String(p.bhk)));
console.log("By type:", count((p) => p.type));