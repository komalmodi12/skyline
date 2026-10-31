"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { PANELS, panelOpacity } from "@/lib/story";
import { createStoryDriver, type StoryDriver } from "@/lib/story-driver";

export default function Story() {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let driver: StoryDriver | null = null;
    let unsubscribe: (() => void) | null = null;
    const hiddenState: boolean[] = [];

    function clearInline() {
      panelRefs.current.forEach((el) => {
        if (!el) return;
        el.style.opacity = "";
        el.style.transform = "";
        el.inert = false;
      });
      if (railRef.current) railRef.current.style.transform = "";
      if (hintRef.current) hintRef.current.style.opacity = "";
      hiddenState.length = 0;
    }

    function start() {
      if (driver || !container || !stage) return;
      driver = createStoryDriver(container, stage);
      unsubscribe = driver.subscribe(({ progress }) => {
        PANELS.forEach((panel, i) => {
          const el = panelRefs.current[i];
          if (!el) return;
          const o = panelOpacity(progress, panel.from, panel.to);
          el.style.opacity = o.toFixed(3);
          el.style.transform = `translateY(${((1 - o) * 24).toFixed(1)}px)`;
          // Dikhne wale panel hi focus/click le sakte hain
          const hidden = o < 0.05;
          if (hiddenState[i] !== hidden) {
            hiddenState[i] = hidden;
            el.inert = hidden;
          }
        });
        if (railRef.current) {
          railRef.current.style.transform = `scaleY(${progress.toFixed(4)})`;
        }
        if (hintRef.current) {
          hintRef.current.style.opacity = String(Math.max(0, 1 - progress * 30));
        }
      });
    }

    function stop() {
      unsubscribe?.();
      unsubscribe = null;
      driver?.destroy();
      driver = null;
      clearInline();
    }

    // Reduced motion: scroll se kuch nahi chalta, sirf static layout dikhta hai
    if (!media.matches) start();
    const onChange = () => (media.matches ? stop() : start());
    media.addEventListener("change", onChange);

    return () => {
      media.removeEventListener("change", onChange);
      stop();
    };
  }, []);

  return (
    <section
      id="story"
      ref={containerRef}
      aria-label="The Skyline story"
      className="relative h-[600svh] motion-reduce:h-auto"
    >
      <div
        ref={stageRef}
        className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:overflow-visible"
      >
        {/* Peeche ki poster image aur (agle step mein) 3D canvas */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-navy motion-reduce:hidden"
        >
          <Image
            src={PANELS[0].poster!.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/40 to-transparent" />
        </div>

        <a
          href="#featured"
          className="absolute left-[5vw] top-4 z-20 -translate-y-24 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-navy transition focus:translate-y-0 motion-reduce:hidden"
        >
          Skip to featured homes
        </a>

        <div
          aria-hidden="true"
          className="absolute right-4 top-1/2 z-10 h-40 w-px -translate-y-1/2 bg-line motion-reduce:hidden"
        >
          <div
            ref={railRef}
            className="h-full origin-top scale-y-0 bg-gold"
          />
        </div>

        <div
          ref={hintRef}
          aria-hidden="true"
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-xs uppercase tracking-[0.2em] text-muted motion-reduce:hidden"
        >
          Scroll ↓
        </div>

        <div className="relative h-full motion-reduce:mx-auto motion-reduce:h-auto motion-reduce:max-w-5xl motion-reduce:space-y-14 motion-reduce:px-[5vw] motion-reduce:py-12">
          {PANELS.map((panel, i) => {
            const Heading = i === 0 ? "h1" : "h2";
            return (
              <div
                key={panel.id}
                className="pointer-events-none absolute inset-0 flex items-center px-[5vw] motion-reduce:pointer-events-auto motion-reduce:static motion-reduce:block motion-reduce:px-0"
              >
                <article
                  ref={(el) => {
                    panelRefs.current[i] = el;
                  }}
                  className={`max-w-md ${
                    i === 0 ? "opacity-100" : "opacity-0"
                  } motion-reduce:max-w-none motion-reduce:opacity-100`}
                >
                  {panel.poster && (
                    <div className="relative mb-6 hidden aspect-video overflow-hidden rounded-2xl border border-line motion-reduce:block">
                      <Image
                        src={panel.poster.src}
                        alt={panel.poster.alt}
                        fill
                        sizes="(min-width: 1024px) 60rem, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="text-xs uppercase tracking-[0.2em] text-gold">
                    {panel.tag}
                  </p>
                  <Heading className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                    {panel.title}
                  </Heading>
                  <p className="mt-3 text-muted">{panel.text}</p>
                  {panel.cta && (
                    <Link
                      href={panel.cta.href}
                      className="pointer-events-auto mt-6 inline-flex min-h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-navy transition hover:-translate-y-0.5"
                    >
                      {panel.cta.label}
                    </Link>
                  )}
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
