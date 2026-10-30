"use client";

import Image from "next/image";
import { useState } from "react";

const arrowClass =
  "absolute top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-navy/80 text-xl text-gold transition hover:bg-navy";

export default function Gallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const total = images.length;
  const go = (i: number) => setIndex((i + total) % total);

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={`${title} photos`}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(index - 1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          go(index + 1);
        }
      }}
    >
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-line bg-card">
        <Image
          key={images[index]}
          src={images[index]}
          alt={`${title}, photo ${index + 1} of ${total}`}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="animate-fade-in object-cover"
        />
        <button
          type="button"
          aria-label="Previous photo"
          onClick={() => go(index - 1)}
          className={`${arrowClass} left-3`}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next photo"
          onClick={() => go(index + 1)}
          className={`${arrowClass} right-3`}
        >
          ›
        </button>
        <p aria-live="polite" className="sr-only">
          Photo {index + 1} of {total}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-3">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`Show photo ${i + 1}`}
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
            className={`relative aspect-[3/2] overflow-hidden rounded-xl border-2 transition ${
              i === index
                ? "border-gold"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 1024px) 15vw, 25vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
