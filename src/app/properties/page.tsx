import type { Metadata } from "next";
import PropertyCard from "@/components/PropertyCard";
import { listProperties } from "@/lib/properties";
import { PropertyQuerySchema } from "@/lib/property-query";

export const metadata: Metadata = {
  title: "Homes",
  description:
    "Browse apartments, penthouses and villas at Skyline. Filter by price, BHK, type and furnishing.",
};

export default function PropertiesPage() {
  const result = listProperties(PropertyQuerySchema.parse({}));

  return (
    <div className="mx-auto max-w-7xl px-[5vw] py-10">
      <h1 className="font-serif text-4xl">Homes at Skyline</h1>
      <p className="mt-2 text-muted">{result.total} homes</p>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {result.items.map((property, i) => (
          <li key={property.id}>
            <PropertyCard property={property} priority={i < 3} />
          </li>
        ))}
      </ul>
    </div>
  );
}
