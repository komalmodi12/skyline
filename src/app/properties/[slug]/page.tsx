import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import PropertyCard from "@/components/PropertyCard";
import { formatArea, formatPrice } from "@/lib/format";
import {
  getAllSlugs,
  getPropertyBySlug,
  getSimilarProperties,
} from "@/lib/properties";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };

// Build ke time par saari 60 pages ban jaati hain
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) return { title: "Home not found" };

  const title = `${property.title} · ${formatPrice(property.priceLakh)}`;
  const url = `/properties/${property.slug}`;

  return {
    title,
    description: property.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Skyline`,
      description: property.description,
      url,
      type: "website",
      images: [
        {
          url: property.images[0],
          width: 1200,
          height: 800,
          alt: property.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Skyline`,
      description: property.description,
      images: [property.images[0]],
    },
  };
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) {
    notFound();
  }
  const similar = getSimilarProperties(property);
  const pricePerSqFt = Math.round(
    (property.priceLakh * 100000) / property.areaSqFt
  );

  const specs: [string, string][] = [
    ["Bedrooms", `${property.bhk} BHK`],
    ["Area", formatArea(property.areaSqFt)],
    ["Type", property.type],
    ["Furnishing", property.furnished ? "Furnished" : "Unfurnished"],
    ["Price per sq ft", `₹${pricePerSqFt.toLocaleString("en-IN")}`],
    ["Locality", `${property.locality}, ${property.city}`],
  ];

  return (
    <div className="mx-auto max-w-7xl px-[5vw] py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/properties" className="hover:text-gold">
          Homes
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{property.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          <Gallery images={property.images} title={property.title} />

          <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-serif text-4xl text-gold">
                {formatPrice(property.priceLakh)}
              </p>
              <h1 className="mt-1 text-xl font-medium">{property.title}</h1>
              <p className="mt-1 text-sm text-muted">
                {property.locality}, {property.city}
              </p>
            </div>
            <a
              href="#enquire"
              className="inline-flex min-h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-navy transition hover:-translate-y-0.5"
            >
              Book a visit
            </a>
          </div>

          <p className="mt-6 max-w-prose text-muted">{property.description}</p>

          <section aria-labelledby="specs-heading" className="mt-10">
            <h2 id="specs-heading" className="font-serif text-2xl">
              Specifications
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-line bg-card p-4"
                >
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="mt-1 text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="amenities-heading" className="mt-10">
            <h2 id="amenities-heading" className="font-serif text-2xl">
              Amenities
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {property.amenities.map((a) => (
                <li
                  key={a}
                  className="rounded-full border border-line px-4 py-2 text-sm"
                >
                  {a}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="location-heading" className="mt-10">
            <h2 id="location-heading" className="font-serif text-2xl">
              Location
            </h2>
            <div className="relative mt-4 overflow-hidden rounded-2xl border border-line bg-card p-6">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="relative flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-navy"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
                  </svg>
                </span>
                <div>
                  <p className="font-medium">
                    {property.locality}, {property.city}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    The exact address is shared when your visit is confirmed.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside
          id="enquire"
          className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start"
        >
          <div className="rounded-2xl border border-line bg-card p-6">
            <h2 className="font-serif text-2xl">Book a visit</h2>
            <p className="mt-2 text-sm text-muted">
              The enquiry form is added in the next step.
            </p>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar-heading" className="mt-16">
          <h2 id="similar-heading" className="font-serif text-2xl">
            Similar homes
          </h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((p) => (
              <li key={p.id}>
                <PropertyCard property={p} as="h3" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
