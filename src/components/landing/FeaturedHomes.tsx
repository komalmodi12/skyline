import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { listProperties } from "@/lib/properties";
import { PropertyQuerySchema } from "@/lib/property-query";

// Wahi listProperties() jo /api/properties use karta hai, build ke time par chalta hai.
// Isse koi extra network request ya layout shift nahi hota.
export default function FeaturedHomes() {
  const { items } = listProperties(PropertyQuerySchema.parse({ limit: 6 }));

  return (
    <section
      id="featured"
      aria-labelledby="featured-heading"
      className="mx-auto max-w-7xl scroll-mt-20 px-[5vw] py-20"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="featured-heading" className="font-serif text-4xl">
            Featured homes
          </h2>
          <p className="mt-2 text-muted">
            A few of the newest residences at Skyline.
          </p>
        </div>
        <Link
          href="/properties"
          className="inline-flex min-h-11 items-center rounded-full border border-gold px-5 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-navy"
        >
          View all homes
        </Link>
      </div>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((property) => (
          <li key={property.id}>
            <PropertyCard property={property} as="h3" />
          </li>
        ))}
      </ul>
    </section>
  );
}
