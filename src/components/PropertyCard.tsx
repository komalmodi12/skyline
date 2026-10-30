import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/types/property";
import { formatArea, formatPrice } from "@/lib/format";

export default function PropertyCard({
  property,
  priority = false,
  as: Heading = "h2",
}: {
  property: Property;
  priority?: boolean;
  as?: "h2" | "h3";
}) {
  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-card transition duration-200 hover:-translate-y-1 hover:border-gold"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-line">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {property.furnished && (
          <span className="absolute left-3 top-3 rounded-full bg-navy/80 px-3 py-1 text-xs text-gold">
            Furnished
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-serif text-xl text-gold">
          {formatPrice(property.priceLakh)}
        </p>
        <Heading className="mt-1 text-sm font-medium">{property.title}</Heading>
        <p className="mt-1 text-xs text-muted">
          {property.locality}, {property.city}
        </p>
        <p className="mt-2 text-xs text-muted">
          {property.bhk} BHK · {property.type} · {formatArea(property.areaSqFt)}
        </p>
      </div>
    </Link>
  );
}
