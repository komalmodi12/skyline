"use client";

import { useEffect, type ReactNode } from "react";

const KEY = "skyline:listing-scroll";

const currentUrl = () => window.location.pathname + window.location.search;

// Card ya link par click karte waqt scroll position save hoti hai.
// Isi URL par wapas aane par (Back) position restore hoti hai.
export default function ScrollMemory({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (!raw) return;
      sessionStorage.removeItem(KEY);
      const saved = JSON.parse(raw) as { url?: string; y?: number };
      if (saved.url !== currentUrl() || typeof saved.y !== "number") return;
      const y = saved.y;
      window.scrollTo(0, y);
      requestAnimationFrame(() => window.scrollTo(0, y));
    } catch {
      // sessionStorage band ho toh bas restore nahi hoga
    }
  }, []);

  return (
    <div
      onClickCapture={(e) => {
        if (!(e.target instanceof Element) || !e.target.closest("a")) return;
        try {
          sessionStorage.setItem(
            KEY,
            JSON.stringify({ url: currentUrl(), y: window.scrollY })
          );
        } catch {
          // ignore
        }
      }}
    >
      {children}
    </div>
  );
}
