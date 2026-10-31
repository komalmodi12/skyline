// Landing page ki kahani: har panel ek scroll range (0 se 1) mein dikhta hai.
// Yahi data server HTML, scroll driver aur reduced-motion layout, teeno use karte hain.

export interface StoryPanel {
  id: string;
  tag: string;
  title: string;
  text: string;
  from: number;
  to: number;
  poster?: { src: string; alt: string }; // reduced-motion layout ki static image
  cta?: { label: string; href: string };
}

export const PANELS: StoryPanel[] = [
  {
    id: "arrival",
    tag: "1 · Arrival",
    title: "Live above the skyline.",
    text: "62 floors of residences. Scroll to begin.",
    from: -1,
    to: 0.16,
    poster: {
      src: "/images/story/scene-1-arrival.webp",
      alt: "The Skyline tower at dusk, standing among lower buildings.",
    },
  },
  {
    id: "buildup",
    tag: "2 · Build-up",
    title: "Floor by floor.",
    text: "Floors assemble as you scroll and reverse as you scroll back.",
    from: 0.2,
    to: 0.44,
    poster: {
      src: "/images/story/scene-2-buildup.webp",
      alt: "The tower partly built, with a crane at the top.",
    },
  },
  {
    id: "inside",
    tag: "3 · Inside a home",
    title: "Walls peel away.",
    text: "Upper floors lift off to reveal the 3 BHK plan.",
    from: 0.47,
    to: 0.7,
    poster: {
      src: "/images/story/scene-3-inside.webp",
      alt: "One floor of the tower highlighted, with a 3 BHK floor plan beside it.",
    },
  },
  {
    id: "pool",
    tag: "4 · Amenities 1/3",
    title: "Infinity pool.",
    text: "A podium pool at the foot of the tower.",
    from: 0.7,
    to: 0.8,
    poster: {
      src: "/images/story/scene-4-amenities.webp",
      alt: "The tower with a pool, a gym and a garden at its base.",
    },
  },
  {
    id: "gym",
    tag: "4 · Amenities 2/3",
    title: "Sky gym.",
    text: "Full-height glass with city views.",
    from: 0.8,
    to: 0.86,
  },
  {
    id: "garden",
    tag: "4 · Amenities 3/3",
    title: "Terrace garden.",
    text: "Green space between you and the street.",
    from: 0.86,
    to: 0.93,
  },
  {
    id: "cta",
    tag: "5 · Your move",
    title: "Find your floor.",
    text: "The scene settles at dusk.",
    from: 0.94,
    to: 9,
    poster: {
      src: "/images/story/scene-5-dusk.webp",
      alt: "The tower at night with its windows lit.",
    },
    cta: { label: "Explore homes", href: "/properties" },
  },
];

// 0 se 1 ke beech: range ke andar 1, kinaaron par 0, beech mein smooth
export function panelOpacity(p: number, from: number, to: number, fade = 0.025) {
  return Math.max(0, Math.min(1, Math.min((p - from) / fade, (to - p) / fade)));
}
