"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { MNT, type Product } from "@/lib/products";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [shade, setShade] = useState(product.shades?.[0] ?? product.shade);

  return (
    <div className="flex flex-col gap-6">
      {/* Shades */}
      {product.shades && product.shades.length > 1 && (
        <div>
          <span className="mb-2 block text-sm font-medium">
            Өнгө сонгох
          </span>
          <div className="flex gap-2.5">
            {product.shades.map((s) => (
              <button
                key={s}
                onClick={() => setShade(s)}
                aria-label={`Өнгө ${s}`}
                className={`h-9 w-9 rounded-full ring-2 ring-offset-2 transition-all ${
                  shade === s ? "ring-foreground" : "ring-transparent"
                }`}
                style={{ background: s }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Qty + add */}
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-line">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid h-11 w-11 place-items-center text-muted hover:text-foreground"
          >
            −
          </button>
          <span className="w-8 text-center font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="grid h-11 w-11 place-items-center text-muted hover:text-foreground"
          >
            +
          </button>
        </div>
        <button
          onClick={() =>
            add(
              {
                slug: product.slug,
                name: product.name,
                brand: product.brand,
                price: product.price,
                shade,
              },
              qty
            )
          }
          className="flex-1 rounded-full bg-foreground py-3.5 text-sm font-medium text-white transition-colors hover:bg-rose-deep"
        >
          Сагслах · {MNT(product.price * qty)}
        </button>
      </div>
    </div>
  );
}
