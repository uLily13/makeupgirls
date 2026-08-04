"use client";

import { useState } from "react";
import { ProductVisual } from "@/components/ProductVisual";

export function ProductGallery({
  images,
  shade,
  colors,
}: {
  images: string[];
  shade: string;
  colors: { hex: string; image?: string }[];
}) {
  // Build a thumbnail set from images (preferred) or colour swatches.
  const thumbs = images.length
    ? images.map((src) => ({ image: src as string | undefined, shade }))
    : (colors.length ? colors : [{ hex: shade }]).map((c) => ({
        image: c.image,
        shade: c.hex,
      }));

  const [active, setActive] = useState(0);
  const main = thumbs[active] ?? thumbs[0];

  return (
    <div className="flex flex-col gap-4">
      <ProductVisual
        shade={main.shade ?? shade}
        image={main.image}
        className="aspect-square w-full rounded-3xl"
      />
      {thumbs.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {thumbs.slice(0, 10).map((t, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`aspect-square overflow-hidden rounded-xl bg-blush ring-2 transition-all ${
                active === i ? "ring-foreground" : "ring-transparent"
              }`}
            >
              <ProductVisual
                shade={t.shade ?? shade}
                image={t.image}
                className="h-full w-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
