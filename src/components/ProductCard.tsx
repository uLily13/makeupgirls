"use client";

import Link from "next/link";
import { MNT, productBadges, type Product } from "@/lib/products";
import { ProductVisual } from "./ProductVisual";
import { ProductBadges } from "./ProductBadges";
import { useFavorites } from "@/lib/favorites";
import { useQuickView } from "@/lib/quickview";

export function ProductCard({ product }: { product: Product }) {
  const { open: openQuickView } = useQuickView();
  const { has, toggle } = useFavorites();
  const soldOut = product.stock <= 0;
  const onSale = product.oldPrice && product.oldPrice > product.price;
  const discount = onSale
    ? Math.round((1 - product.price / product.oldPrice!) * 100)
    : 0;
  const fav = has(product.slug);
  const imgs = (
    product.images?.length
      ? product.images
      : (product.colors ?? []).map((c) => c.image).filter(Boolean)
  ) as string[];
  const baseImage = imgs[0];
  const hoverImage = imgs[1];

  return (
    <div className="group flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="squish relative block aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-[#f6f4f3] shadow-[0_16px_40px_-24px_rgba(125,74,92,0.5)]"
      >
        {/* base image — the positioning lives on this plain wrapper so it never
            fights ProductVisual's own `relative` (both would set `position`). */}
        <div
          className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 ${
            hoverImage ? "group-hover:opacity-0" : ""
          }`}
        >
          <ProductVisual
            shade={product.shade}
            image={baseImage}
            category={product.category}
            className={`h-full w-full ${soldOut ? "opacity-60 grayscale" : ""}`}
          />
        </div>
        {/* hover image (crossfade) */}
        {hoverImage && (
          <div className="absolute inset-0 opacity-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:opacity-100">
            <ProductVisual
              shade={product.shade}
              image={hoverImage}
              className={`h-full w-full ${soldOut ? "opacity-60 grayscale" : ""}`}
            />
          </div>
        )}

        {/* badges */}
        <div className="absolute left-3 top-3">
          <ProductBadges badges={productBadges(product)} discount={discount} />
          {soldOut && (
            <span className="mt-1 inline-block rounded-full bg-foreground/80 px-2.5 py-1 text-[10px] font-semibold text-white">
              Дууссан
            </span>
          )}
        </div>

        {/* favorite */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(product.slug);
          }}
          aria-label="Хадгалах"
          className="absolute right-3 top-3 text-rose-deep transition-transform hover:scale-110 [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.4))]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"}>
            <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0112 5a4.5 4.5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            openQuickView(product);
          }}
          className="btn-liquid absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-1.5 bg-white/95 py-2.5 text-sm font-medium text-foreground opacity-0 shadow-[0_10px_28px_-14px_rgba(125,74,92,0.7)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white group-hover:translate-y-0 group-hover:opacity-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          Харах
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
          {onSale && (
            <span className="text-sm text-muted line-through">
              {MNT(product.oldPrice!)}
            </span>
          )}
          {product.reviews > 0 && (
            <span className="ml-auto text-xs text-muted">
              ★ {product.rating.toFixed(1)} ({product.reviews})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
