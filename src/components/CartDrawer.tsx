"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { MNT } from "@/lib/products";

export function CartDrawer() {
  const { open, setOpen, items, subtotal, setQty, remove } = useCart();
  const freeShip = 100000;
  const remaining = Math.max(0, freeShip - subtotal);
  const pct = Math.min(100, (subtotal / freeShip) * 100);

  return (
    <div
      className={`fixed inset-0 z-50 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-plum/20 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        style={{
          transform: open ? "translateX(0)" : "translateX(calc(100% + 20px))",
        }}
        className="absolute right-2 top-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] max-w-md transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
      >
      <aside className="glass flex h-full w-full flex-col rounded-3xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-xl">
            Сагс{" "}
            <span className="text-muted text-base">({items.length})</span>
          </h2>
          <button onClick={() => setOpen(false)} aria-label="Хаах">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-blush text-rose">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M6 8h12l-1 12H7L6 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-muted">Таны сагс хоосон байна.</p>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-white"
            >
              Дэлгүүр рүү
            </button>
          </div>
        ) : (
          <>
            {/* Free-shipping progress */}
            <div className="border-b border-line px-6 py-4">
              <p className="mb-2 text-xs text-muted">
                {remaining > 0 ? (
                  <>
                    Үнэгүй хүргэлт хүртэл{" "}
                    <span className="font-semibold text-foreground">
                      {MNT(remaining)}
                    </span>{" "}
                    үлдлээ
                  </>
                ) : (
                  <span className="font-medium text-rose-deep">
                    ✦ Танд үнэгүй хүргэлт нэмэгдлээ!
                  </span>
                )}
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-blush">
                <div
                  className="h-full rounded-full bg-rose transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.map((it) => (
                <div key={it.slug} className="flex gap-4 py-4">
                  <div
                    className="h-20 w-16 shrink-0 rounded-xl"
                    style={{
                      background: `radial-gradient(120% 120% at 30% 20%, #fff, var(--blush))`,
                    }}
                  >
                    <div
                      className="mx-auto mt-3 h-12 w-6 rounded-full"
                      style={{ background: it.shade }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-muted">
                      {it.brand}
                    </span>
                    <span className="text-sm font-medium leading-tight">
                      {it.name}
                    </span>
                    <span className="mt-1 text-sm font-semibold">
                      {MNT(it.price)}
                    </span>
                    <div className="mt-auto flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-line">
                        <button
                          onClick={() => setQty(it.slug, it.qty - 1)}
                          className="grid h-7 w-7 place-items-center text-muted hover:text-foreground"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm">{it.qty}</span>
                        <button
                          onClick={() => setQty(it.slug, it.qty + 1)}
                          className="grid h-7 w-7 place-items-center text-muted hover:text-foreground"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remove(it.slug)}
                        className="text-xs text-muted underline hover:text-rose-deep"
                      >
                        Хасах
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-line px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-muted">Дүн</span>
                <span className="font-display text-xl">{MNT(subtotal)}</span>
              </div>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="btn-liquid block bg-foreground py-3.5 text-center text-sm font-medium text-white"
              >
                Захиалга хийх
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="mt-2 w-full py-2 text-center text-xs text-muted underline"
              >
                Үргэлжлүүлэн худалдан авах
              </button>
            </div>
          </>
        )}
      </aside>
      </div>
    </div>
  );
}
