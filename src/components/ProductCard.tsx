"use client";

import Link from "next/link";
import { MNT, type Product } from "@/lib/products";
import { ProductVisual } from "./ProductVisual";
import { useCart } from "@/lib/cart";

const badgeStyle: Record<string, string> = {
  Шинэ: "text-foreground",
  Хит: "text-rose-deep",
  Хямдрал: "text-gold",
};

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <div className="group flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="squish relative block aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-blush shadow-[0_16px_40px_-24px_rgba(125,74,92,0.5)]"
      >
        <ProductVisual
          shade={product.shade}
          category={product.category}
          className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />

        {product.badge && (
          <span
            className={`glass glass-rim absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
              badgeStyle[product.badge]
            }`}
          >
            {product.badge}
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            add({
              slug: product.slug,
              name: product.name,
              brand: product.brand,
              price: product.price,
              shade: product.shade,
            });
          }}
          className="btn-liquid glass glass-rim absolute inset-x-3 bottom-3 translate-y-3 py-2.5 text-sm font-medium text-foreground opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100"
        >
          Сагслах
        </button>
      </Link>

      <div className="mt-3.5 flex flex-col gap-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted">
          {product.brand}
        </span>
        <Link
          href={`/product/${product.slug}`}
          className="link-underline self-start text-[15px] font-medium leading-snug"
        >
          {product.name}
        </Link>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-[15px] font-semibold">{MNT(product.price)}</span>
          {product.oldPrice && (
            <span className="text-sm text-muted line-through">
              {MNT(product.oldPrice)}
            </span>
          )}
          <span className="ml-auto text-xs text-muted">
            ★ {product.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
