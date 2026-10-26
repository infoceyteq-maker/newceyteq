/**
 * Ceyteq logo preparation.
 *
 * The supplied logo is a JPEG photographed on a pure-white sheet of paper, with a
 * soft grey drop shadow baked into the pixels. Neumorphic UI needs the mark to sit
 * *on* the ash surface, so we programmatically:
 *
 *   1. detect the paper background by flooding in from the edges (so the white
 *      inside the "Q" / rings is preserved),
 *   2. rebuild a per-pixel alpha channel with edge feathering,
 *   3. un-premultiply the colour that was mixed with white (kills white fringing),
 *   4. trim the empty margins, then export @1x/@2x PNGs (and a square favicon).
 *
 * Run with:  npm run logo
 */
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

const SRC = path.join(process.cwd(), "assets/source/ceyteq-logo.jpg");
const OUT_DIR = path.join(process.cwd(), "public/brand");

const { data, info } = await sharp(SRC)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const out = Buffer.alloc(width * height * 4);

const at = (x, y) => (y * width + x) * channels;
const luma = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const sat = (r, g, b) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
};

// ---- 1. Flood fill from the border to find the paper background -------------
const isPaper = (i) => {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  return luma(r, g, b) > 0.9 && sat(r, g, b) < 0.09;
};

const bg = new Uint8Array(width * height);
const stack = [];
for (let x = 0; x < width; x++) {
  stack.push([x, 0], [x, height - 1]);
}
for (let y = 0; y < height; y++) {
  stack.push([0, y], [width - 1, y]);
}
while (stack.length) {
  const [x, y] = stack.pop();
  if (x < 0 || y < 0 || x >= width || y >= height) continue;
  const p = y * width + x;
  if (bg[p]) continue;
  if (!isPaper(at(x, y))) continue;
  bg[p] = 1;
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

// ---- 2. Alpha build --------------------------------------------------------
// Distance from "paper white" drives alpha. The logo is 3D artwork, so a gentle
// ramp keeps the chrome highlights while the paper itself turns transparent.
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const p = y * width + x;
    const i = at(x, y);
    let r = data[i], g = data[i + 1], b = data[i + 2];

    const L = luma(r, g, b);
    const S = sat(r, g, b);

    let alpha;
    if (bg[p]) {
      alpha = 0;
    } else if (S >= 0.17) {
      // Saturated artwork (Ceyteq blues) is fully opaque.
      alpha = 1;
    } else {
      // Neutral pixels: the slogan / navy faces are dark (L < 0.42) and stay.
      // The soft grey paper shadow baked into the artwork (L ~ 0.5-0.75) is
      // faded out so the mark can sit on any surface.
      alpha = Math.min(1, Math.max(0, (0.58 - L) / 0.2));
      // Never keep a neutral pixel brighter than the surface it will sit on.
      if (L > 0.72) alpha = 0;
    }

    // ---- 3. Un-premultiply away the white paper -----------------------------
    if (alpha > 0 && alpha < 1) {
      const a = Math.max(alpha, 0.08);
      r = Math.min(255, Math.max(0, (r - (1 - a) * 255) / a));
      g = Math.min(255, Math.max(0, (g - (1 - a) * 255) / a));
      b = Math.min(255, Math.max(0, (b - (1 - a) * 255) / a));
    }

    const o = p * 4;
    out[o] = Math.round(r);
    out[o + 1] = Math.round(g);
    out[o + 2] = Math.round(b);
    out[o + 3] = Math.round(alpha * 255);
  }
}

await fs.mkdir(OUT_DIR, { recursive: true });

const base = sharp(out, { raw: { width, height, channels: 4 } }).trim({ threshold: 2 });

const trimmedMeta = await base.clone().png().toBuffer({ resolveWithObject: true });
const tw = trimmedMeta.info.width;
const th = trimmedMeta.info.height;

await base.clone().resize({ width: 900, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, "ceyteq-logo.png"));
await base.clone().resize({ width: 1800, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, "ceyteq-logo@2x.png"));

// Square icon: just the "C" ring mark (right hand side of the lockup).
const iconCropWidth = Math.round(th * 1.02);
const iconLeft = Math.max(0, tw - iconCropWidth);
await base
  .clone()
  .extract({ left: iconLeft, top: 0, width: iconCropWidth, height: th })
  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(path.join(OUT_DIR, "ceyteq-mark.png"));

// Small header wordmark (fast first paint, crisp on retina at 2x).
await base.clone().resize({ width: 460, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, "ceyteq-logo-sm.png"));

console.log(`logo: source ${width}x${height} → trimmed ${tw}x${th}`);
