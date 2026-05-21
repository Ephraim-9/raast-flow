/**
 * Regenerate PWA launcher icons from public/icon.svg.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import sharp from "sharp";
import { readFileSync } from "fs";
import { mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });
const svg = readFileSync("public/icon.svg");

await sharp(svg).resize(192, 192).png().toFile("public/icons/icon-192.png");
await sharp(svg).resize(512, 512).png().toFile("public/icons/icon-512.png");

console.log("Wrote public/icons/icon-192.png and icon-512.png");
