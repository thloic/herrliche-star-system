import sharp from "sharp";
import { mkdirSync } from "node:fs";

const OUT_DIR = new URL("../public/icons", import.meta.url).pathname;
mkdirSync(OUT_DIR, { recursive: true });

// Fond plein bord-à-bord (safe zone maskable respectée par le texte centré,
// taille conservatrice) + "HS" en blanc, gras — reprend le badge du login.
function svg(size) {
  const fontSize = Math.round(size * 0.4);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#FF6B1A"/>
  <text x="50%" y="53%" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="${fontSize}" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">HS</text>
</svg>`;
}

const sizes = [192, 512];

for (const size of sizes) {
  await sharp(Buffer.from(svg(size)))
    .png()
    .toFile(`${OUT_DIR}/icon-${size}.png`);
  console.log(`wrote icon-${size}.png`);
}

await sharp(Buffer.from(svg(32))).png().toFile(`${OUT_DIR}/icon-32.png`);
console.log("wrote icon-32.png");

// Conventions Next.js : app/icon.png et app/apple-icon.png génèrent
// automatiquement les <link> appropriés dans le <head>.
const APP_DIR = new URL("../app", import.meta.url).pathname;
await sharp(Buffer.from(svg(512))).png().toFile(`${APP_DIR}/icon.png`);
console.log("wrote app/icon.png");
await sharp(Buffer.from(svg(180))).png().toFile(`${APP_DIR}/apple-icon.png`);
console.log("wrote app/apple-icon.png");
