"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PopupSlide } from "@/lib/products";

// Entry popup shown once per browser session on the homepage. Cycles through
// admin-configured slides (image and/or title + text + CTA). Closes on ✕,
// backdrop click or Escape.
const SEEN_KEY = "makeupgirls_popup_seen";

export function PopupCarousel({ slides }: { slides: PopupSlide[] }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const n = slides.length;

  const close = () => {
    sessionStorage.setItem(SEEN_KEY, "1");
    setOpen(false);
  };

  useEffect(() => {
    if (n === 0) return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [n]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        sessionStorage.setItem(SEEN_KEY, "1");
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Auto-advance while open.
  useEffect(() => {
    if (!open || n <= 1) return;
    const t = setInterval(() => setIdx((v) => (v + 1) % n), 4500);
    return () => clearInterval(t);
  }, [open, n]);

  if (!open || n === 0) return null;
  const s = slides[idx % n];

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-plum/40 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-popdown relative w-full max-w-md overflow-hidden rounded-3xl bg-surface shadow-[0_30px_70px_-20px_rgba(125,74,92,0.6)]"
      >
        <button
          onClick={close}
          aria-label="Хаах"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-lg text-foreground shadow hover:bg-white"
        >
          ✕
        </button>

        {s.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.image} alt={s.title || ""} className="max-h-[52vh] w-full object-cover" />
        )}

        {(s.title || s.subtitle || s.link) && (
          <div className="p-6 text-center">
            {s.title && <h3 className="font-display text-2xl">{s.title}</h3>}
            {s.subtitle && <p className="mt-2 text-sm text-muted">{s.subtitle}</p>}
            {s.link && (
              <Link
                href={s.link}
                onClick={close}
                className="btn-liquid mt-5 inline-block bg-foreground px-7 py-3 text-sm font-medium text-white"
              >
                {s.linkLabel || "Дэлгэрэнгүй"}
              </Link>
            )}
          </div>
        )}

        {n > 1 && (
          <div className="flex justify-center gap-2 pb-5">
            {slides.map((sl, i) => (
              <button
                key={sl.id}
                onClick={() => setIdx(i)}
                aria-label={`Слайд ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === idx % n ? "w-6 bg-rose-deep" : "w-2 bg-line hover:bg-rose/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
