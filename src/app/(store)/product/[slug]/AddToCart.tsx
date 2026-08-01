"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { MNT, type Product } from "@/lib/products";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const colors = product.colors ?? [];
  const multi = colors.length > 1;
  const [picked, setPicked] = useState<number | null>(multi ? null : 0);
  const soldOut = product.stock <= 0;
  const chosen = picked != null ? colors[picked] : undefined;

  const addToCart = () => {
    if (soldOut) return;
    if (multi && picked == null) return;
    add(
      {
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        price: product.price,
        shade: chosen?.hex ?? product.shade,
        color: chosen?.name,
      },
      qty
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Colours */}
      {colors.length > 0 && (
        <div>
          <span className="mb-2 flex items-center gap-2 text-sm font-medium">
            Өнгө сонгох
            {chosen && <span className="text-muted">· {chosen.name}</span>}
          </span>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((c, i) => (
              <button
                key={i}
                onClick={() => setPicked(i)}
                aria-label={c.name}
                title={c.name}
                className={`h-9 w-9 overflow-hidden rounded-full ring-2 ring-offset-2 transition-all ${
                  picked === i ? "ring-foreground" : "ring-transparent hover:ring-line"
                }`}
                style={{ background: c.hex }}
              >
                {c.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt="" className="h-full w-full object-cover" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stock note */}
      <div className="text-sm">
        {soldOut ? (
          <span className="font-medium text-red-500">Дууссан</span>
        ) : product.stock <= 5 ? (
          <span className="text-rose-deep">Зөвхөн {product.stock}ш үлдсэн</span>
        ) : (
          <span className="text-green-600">Бэлэн байгаа</span>
        )}
      </div>

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
            onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))}
            className="grid h-11 w-11 place-items-center text-muted hover:text-foreground"
          >
            +
          </button>
        </div>
        <button
          onClick={addToCart}
          disabled={soldOut || (multi && picked == null)}
          className="flex-1 rounded-full bg-foreground py-3.5 text-sm font-medium text-white transition-colors hover:bg-rose-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {soldOut
            ? "Дууссан"
            : multi && picked == null
              ? "Өнгөө сонгоно уу"
              : `Сагслах · ${MNT(product.price * qty)}`}
        </button>
      </div>
    </div>
  );
}
