// Colour helpers for image-based ("search by colour") product matching.
// No ML / external services — we read the uploaded image's dominant colour on
// a canvas and rank products by perceptual distance to their shade swatches.

export type RGB = { r: number; g: number; b: number };

export function hexToRgb(hex: string): RGB | null {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const h = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

// Perceptual-ish colour distance ("redmean") — cheap and noticeably better than
// plain RGB Euclidean for skin/makeup tones. Lower = closer.
export function colorDistance(a: RGB, b: RGB): number {
  const rmean = (a.r + b.r) / 2;
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(
    (2 + rmean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rmean) / 256) * db * db
  );
}

// Distance from a target colour to the closest of a product's swatch hexes.
export function distanceToSwatches(target: RGB, hexes: string[]): number {
  let best = Infinity;
  for (const hex of hexes) {
    const rgb = hexToRgb(hex);
    if (!rgb) continue;
    best = Math.min(best, colorDistance(target, rgb));
  }
  return best;
}

// Extract a representative dominant colour from an image file (browser only).
// Skips near-white/near-black/transparent pixels so photo backgrounds and the
// black letterbox bars of vertical shots don't wash out the makeup tone.
export function dominantColorFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const S = 60;
        const canvas = document.createElement("canvas");
        canvas.width = S;
        canvas.height = S;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no canvas context");
        ctx.drawImage(img, 0, 0, S, S);
        const data = ctx.getImageData(0, 0, S, S).data;
        let r = 0, g = 0, b = 0, count = 0;
        let ra = 0, ga = 0, ba = 0, all = 0; // fallback: plain average
        for (let i = 0; i < data.length; i += 4) {
          const R = data[i], G = data[i + 1], B = data[i + 2], A = data[i + 3];
          if (A > 200) {
            ra += R; ga += G; ba += B; all++;
          }
          // skip transparent, near-white and near-black
          if (A < 200) continue;
          if (R > 238 && G > 238 && B > 238) continue;
          if (R < 16 && G < 16 && B < 16) continue;
          r += R; g += G; b += B; count++;
        }
        URL.revokeObjectURL(url);
        if (count > 0) resolve(rgbToHex({ r: r / count, g: g / count, b: b / count }));
        else if (all > 0) resolve(rgbToHex({ r: ra / all, g: ga / all, b: ba / all }));
        else reject(new Error("empty image"));
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image load failed"));
    };
    img.src = url;
  });
}
