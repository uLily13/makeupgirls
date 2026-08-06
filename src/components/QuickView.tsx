"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuickView } from "@/lib/quickview";
import { useCart } from "@/lib/cart";
import { MNT, productBadges, type Product } from "@/lib/products";
import { ProductVisual } from "./ProductVisual";
import { ProductBadges } from "./ProductBadges";

// Centered popup that opens from a product card's "Харах" button. Shows the
// product and lets the customer pick a colour before adding to the cart.
export function QuickView() {
  const { product, close } = useQuickView();
  const { add } = useCart();

  // Keep the last product mounted through the close animation (so the panel
  // fades out instead of vanishing) and reset the colour/qty selection when a
  // new product opens — done during render via React's "adjust state on prop
  // change" pattern, which avoids setState-in-effect cascades.
  const [shown, setShown] = useState<Product | null>(null);
  const [lastSlug, setLastSlug] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [qty, setQty] = useState(1);

  if (product && product.slug !== lastSlug) {
    setLastSlug(product.slug);
    setShown(product);
    setPicked((product.colors?.length ?? 0) > 1 ? null : 0);
    setQty(1);
  }

  const open = !!product;
  const colors = shown?.colors ?? [];
  const multi = colors.length > 1;

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  if (!shown) {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-[60] opacity-0"
        aria-hidden
      />
    );
  }

  const p: Product = shown;
  const soldOut = p.stock <= 0;
  const onSale = p.oldPrice && p.oldPrice > p.price;
  const chosen = picked != null ? colors[picked] : undefined;
  const images = (
    p.images?.length
      ? p.images
      : (p.colors ?? []).map((c) => c.image).filter(Boolean)
  ) as string[];
  const heroImage = chosen?.image ?? images[0];

  const addToCart = () => {
    if (soldOut || (multi && picked == null)) return;
    add(
      {
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        price: p.price,
        shade: chosen?.hex ?? p.shade,
        color: chosen?.name,
      },
      qty
    );
    close();
  };

  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      {/* backdrop */}
      <div
        onClick={close}
        className="absolute inset-0 bg-plum/25 backdrop-blur-sm"
      />

      {/* panel */}
      <div className="absolute inset-0 grid place-items-center p-3 sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={p.name}
          style={{ transform: open ? "scale(1)" : "scale(0.96)" }}
          className="card relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:flex-row"
        >
          {/* close */}
          <button
            onClick={close}
            aria-label="Хаах"
            className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-[0_8px_20px_-10px_rgba(125,74,92,0.6)] transition-colors hover:bg-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          {/* image */}
          <div className="relative shrink-0 bg-[#f6f4f3] sm:w-1/2">
            <ProductVisual
              shade={chosen?.hex ?? p.shade}
              image={heroImage}
              category={p.category}
              className={`aspect-[4/5] h-full w-full ${
                soldOut ? "opacity-60 grayscale" : ""
              }`}
            />
            <ProductBadges
              badges={productBadges(p)}
              discount={
                p.oldPrice && p.oldPrice > p.price
                  ? Math.round((1 - p.price / p.oldPrice) * 100)
                  : 0
              }
              className="absolute left-3 top-3"
            />
          </div>

          {/* details */}
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 sm:p-8">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted">
                {p.brand}
              </span>
              <h2 className="mt-1 font-display text-2xl leading-tight">
                {p.name}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-lg font-semibold">{MNT(p.price)}</span>
                {onSale && (
                  <span className="text-sm text-muted line-through">
                    {MNT(p.oldPrice!)}
                  </span>
                )}
                {p.reviews > 0 && (
                  <span className="ml-auto text-xs text-muted">
                    ★ {p.rating.toFixed(1)} ({p.reviews})
                  </span>
                )}
              </div>
            </div>

            {p.short && (
              <p className="text-sm leading-relaxed text-foreground/70">
                {p.short}
              </p>
            )}

            {/* colours */}
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
                        picked === i
                          ? "ring-foreground"
                          : "ring-transparent hover:ring-line"
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

            {/* stock */}
            <div className="text-sm">
              {soldOut ? (
                <span className="font-medium text-red-500">Дууссан</span>
              ) : p.stock <= 5 ? (
                <span className="text-rose-deep">Зөвхөн {p.stock}ш үлдсэн</span>
              ) : (
                <span className="text-green-600">Бэлэн байгаа</span>
              )}
            </div>

            {/* qty + add */}
            <div className="mt-auto flex items-center gap-3 pt-2">
              <div className="flex items-center rounded-full border border-line">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-11 w-11 place-items-center text-muted hover:text-foreground"
                  aria-label="Хасах"
                >
                  −
                </button>
                <span className="w-8 text-center font-medium">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(p.stock || 1, q + 1))}
                  className="grid h-11 w-11 place-items-center text-muted hover:text-foreground"
                  aria-label="Нэмэх"
                >
                  +
                </button>
              </div>
              <button
                onClick={addToCart}
                disabled={soldOut || (multi && picked == null)}
                className="btn-liquid flex-1 bg-foreground py-3.5 text-sm font-medium text-white transition-colors hover:bg-rose-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                {soldOut
                  ? "Дууссан"
                  : multi && picked == null
                    ? "Өнгөө сонгоно уу"
                    : `Сагслах · ${MNT(p.price * qty)}`}
              </button>
            </div>

            <Link
              href={`/product/${p.slug}`}
              onClick={close}
              className="link-underline self-start text-sm font-medium text-rose-deep"
            >
              Дэлгэрэнгүй үзэх →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
