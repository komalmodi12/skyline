import { mkdirSync } from "node:fs";
import sharp from "sharp";

const W = 1200;
const H = 800;
const GROUND = 720;

// [aasmaan upar, aasmaan neeche, windows ka rang]
const PALETTES = [
  ["#0E1320", "#2A3A66", "#C9A66B"],
  ["#1B1038", "#5B3A8C", "#F2B880"],
  ["#0B2230", "#1F5D73", "#F0D9A0"],
  ["#2A1426", "#7A3B5C", "#F5C28B"],
  ["#10221C", "#2F6B58", "#E8D3A2"],
  ["#1A1A2E", "#46508A", "#D9B77E"],
  ["#2B1B12", "#8A5A3C", "#F3D9A8"],
  ["#0E1D3A", "#3B6AA6", "#E9CF9B"],
];

function buildSvg(n: number) {
  const [top, mid, accent] = PALETTES[n - 1];
  const mainH = 520 + n * 12;
  const side = [
    { x: 90, w: 160, h: 300 + (n % 3) * 40 },
    { x: 290, w: 130, h: 400 - (n % 2) * 60 },
    { x: 790, w: 150, h: 380 + (n % 4) * 20 },
    { x: 970, w: 150, h: 300 + (n % 2) * 70 },
  ];

  const block = (x: number, w: number, h: number, fill: string) =>
    `<rect x="${x}" y="${GROUND - h}" width="${w}" height="${h}" fill="${fill}"/>` +
    `<rect x="${x}" y="${GROUND - h}" width="${w}" height="${h}" fill="url(#win)"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${top}"/>
      <stop offset="1" stop-color="${mid}"/>
    </linearGradient>
    <pattern id="win" width="28" height="36" patternUnits="userSpaceOnUse">
      <rect x="7" y="9" width="12" height="18" rx="2" fill="${accent}" opacity="0.5"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${side.map((s) => block(s.x, s.w, s.h, "#0A0E1A")).join("")}
  ${block(480, 240, mainH, "#101830")}
  <rect x="480" y="${GROUND - mainH - 14}" width="240" height="14" fill="${accent}"/>
  <rect y="${GROUND}" width="${W}" height="${H - GROUND}" fill="#080B14"/>
</svg>`;
}

async function main() {
  mkdirSync("public/images/homes", { recursive: true });
  for (let n = 1; n <= 8; n++) {
    await sharp(Buffer.from(buildSvg(n)))
      .webp({ quality: 80 })
      .toFile(`public/images/homes/home-${n}.webp`);
  }
  console.log("Created 8 placeholder images in public/images/homes");
}

main();
