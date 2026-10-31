import { mkdirSync } from "node:fs";
import sharp from "sharp";

const W = 1600;
const H = 900;
const GROUND = 770;
const TOWER_W = 200;
const TOWER_X = (W - TOWER_W) / 2;
const MAX_H = 640;

interface Scene {
  name: string;
  skyTop: string;
  skyBottom: string;
  window: string;
  windowOpacity: number;
  built: number; // 0..1, tower ka kitna hissa bana hai
  crane?: boolean;
  plan?: boolean;
  amenities?: boolean;
  stars?: boolean;
}

const SCENES: Scene[] = [
  { name: "scene-1-arrival", skyTop: "#1b2547", skyBottom: "#7d6b8c", window: "#e9cf9b", windowOpacity: 0.45, built: 1 },
  { name: "scene-2-buildup", skyTop: "#1b2547", skyBottom: "#6f7aa0", window: "#e9cf9b", windowOpacity: 0.35, built: 0.58, crane: true },
  { name: "scene-3-inside", skyTop: "#161d3c", skyBottom: "#5a5f8c", window: "#e9cf9b", windowOpacity: 0.4, built: 1, plan: true },
  { name: "scene-4-amenities", skyTop: "#1a2a45", skyBottom: "#6b88a8", window: "#e9cf9b", windowOpacity: 0.4, built: 1, amenities: true },
  { name: "scene-5-dusk", skyTop: "#0a0e1c", skyBottom: "#2a2f55", window: "#ffd98a", windowOpacity: 0.95, built: 1, stars: true },
];

function skyline(scene: Scene) {
  const blocks = [
    [80, 120, 330], [220, 150, 250], [380, 110, 400], [520, 120, 300],
    [1000, 130, 340], [1150, 110, 420], [1280, 150, 280], [1440, 120, 360],
  ];
  return blocks
    .map(
      ([x, w, h]) =>
        `<rect x="${x}" y="${GROUND - h}" width="${w}" height="${h}" fill="#0a0e1a" opacity="0.92"/>` +
        `<rect x="${x}" y="${GROUND - h}" width="${w}" height="${h}" fill="url(#win)" opacity="${scene.windowOpacity * 0.5}"/>`
    )
    .join("");
}

function tower(scene: Scene) {
  const h = MAX_H * scene.built;
  const top = GROUND - h;
  let out =
    `<rect x="${TOWER_X}" y="${top}" width="${TOWER_W}" height="${h}" fill="url(#tower)"/>` +
    `<rect x="${TOWER_X}" y="${top}" width="${TOWER_W}" height="${h}" fill="url(#win)" opacity="${scene.windowOpacity}"/>`;
  if (scene.built >= 1) {
    out += `<rect x="${TOWER_X + 30}" y="${top - 34}" width="${TOWER_W - 60}" height="34" fill="#c9a66b"/>`;
    out += `<rect x="${W / 2 - 3}" y="${top - 90}" width="6" height="56" fill="#c9a66b"/>`;
  }
  if (scene.crane) {
    const cx = TOWER_X + TOWER_W - 40;
    out += `<rect x="${cx}" y="${top - 170}" width="10" height="170" fill="#c9a66b"/>`;
    out += `<rect x="${cx - 190}" y="${top - 176}" width="320" height="8" fill="#c9a66b"/>`;
    out += `<line x1="${cx - 150}" y1="${top - 168}" x2="${cx - 150}" y2="${top - 90}" stroke="#c9a66b" stroke-width="2"/>`;
    out += `<rect x="${cx - 168}" y="${top - 90}" width="36" height="22" fill="#c9a66b"/>`;
    for (let i = 1; i < 9; i++) {
      out += `<line x1="${TOWER_X}" y1="${top + i * 36}" x2="${TOWER_X + TOWER_W}" y2="${top + i * 36}" stroke="#c9a66b" stroke-width="1" opacity="0.35"/>`;
    }
    out += `<rect x="${TOWER_X}" y="${top}" width="${TOWER_W}" height="16" fill="#c9a66b" opacity="0.55"/>`;
  }
  if (scene.plan) {
    // ek floor highlight + floor plan card
    const fy = GROUND - 330;
    out += `<rect x="${TOWER_X - 6}" y="${fy}" width="${TOWER_W + 12}" height="22" fill="#c9a66b" opacity="0.85"/>`;
    const px = TOWER_X + TOWER_W + 90;
    const py = fy - 150;
    out += `<line x1="${TOWER_X + TOWER_W + 6}" y1="${fy + 11}" x2="${px}" y2="${py + 150}" stroke="#c9a66b" stroke-width="2" stroke-dasharray="6 6"/>`;
    out +=
      `<rect x="${px}" y="${py}" width="330" height="250" rx="16" fill="#161c2e" stroke="#c9a66b" stroke-width="2"/>` +
      `<rect x="${px + 20}" y="${py + 20}" width="160" height="130" fill="none" stroke="#e9cf9b" stroke-width="3"/>` +
      `<rect x="${px + 180}" y="${py + 20}" width="130" height="90" fill="none" stroke="#e9cf9b" stroke-width="3"/>` +
      `<rect x="${px + 180}" y="${py + 110}" width="130" height="40" fill="none" stroke="#e9cf9b" stroke-width="3"/>` +
      `<rect x="${px + 20}" y="${py + 150}" width="290" height="80" fill="#c9a66b" opacity="0.3" stroke="#c9a66b" stroke-width="3"/>` +
      `<circle cx="${px + 100}" cy="${py + 85}" r="8" fill="#e9cf9b"/><circle cx="${px + 245}" cy="${py + 65}" r="8" fill="#e9cf9b"/><circle cx="${px + 165}" cy="${py + 190}" r="8" fill="#e9cf9b"/>`;
  }
  return out;
}

function amenities() {
  return (
    // podium
    `<rect x="560" y="${GROUND - 14}" width="480" height="14" fill="#cfc8b8"/>` +
    // pool
    `<rect x="300" y="${GROUND - 26}" width="250" height="26" fill="#cfc8b8"/>` +
    `<rect x="316" y="${GROUND - 20}" width="218" height="12" fill="#3fa7d6"/>` +
    // gym
    `<rect x="1060" y="${GROUND - 78}" width="180" height="78" fill="#8893a8"/>` +
    `<rect x="1072" y="${GROUND - 66}" width="156" height="46" fill="#e9cf9b" opacity="0.7"/>` +
    // trees
    [620, 680, 740, 800, 860, 920, 980]
      .map((x, i) => `<circle cx="${x}" cy="${GROUND - 24 - (i % 2) * 6}" r="${22 + (i % 3) * 4}" fill="#2f6b3a"/>`)
      .join("")
  );
}

function stars() {
  let out = "";
  for (let i = 0; i < 70; i++) {
    const x = (i * 241) % W;
    const y = (i * 97) % 380;
    out += `<circle cx="${x}" cy="${y}" r="${1 + (i % 3) * 0.6}" fill="#fff" opacity="${0.35 + (i % 5) * 0.12}"/>`;
  }
  return out;
}

function svg(scene: Scene) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${scene.skyTop}"/>
      <stop offset="1" stop-color="${scene.skyBottom}"/>
    </linearGradient>
    <linearGradient id="tower" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0c1428"/>
      <stop offset="0.5" stop-color="#16213f"/>
      <stop offset="1" stop-color="#0c1428"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="1" r="0.7">
      <stop offset="0" stop-color="#c9a66b" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#c9a66b" stop-opacity="0"/>
    </radialGradient>
    <pattern id="win" width="30" height="40" patternUnits="userSpaceOnUse">
      <rect x="8" y="10" width="14" height="20" rx="2" fill="${scene.window}"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${scene.stars ? stars() : ""}
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${skyline(scene)}
  ${tower(scene)}
  ${scene.amenities ? amenities() : ""}
  <rect y="${GROUND}" width="${W}" height="${H - GROUND}" fill="#080b14"/>
</svg>`;
}

async function main() {
  mkdirSync("public/images/story", { recursive: true });
  for (const scene of SCENES) {
    await sharp(Buffer.from(svg(scene)))
      .webp({ quality: 72 })
      .toFile(`public/images/story/${scene.name}.webp`);
  }
  console.log("Created", SCENES.length, "posters in public/images/story");
}

main();
