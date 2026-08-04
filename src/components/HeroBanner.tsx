"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Slide = {
  image: string;
  badge: string;
  title: string;
  accent: string;
  subtitle: string;
};

// Full-bleed hero carousel. Slide 1 uses the hero.* keys; optional slides 2–3
// use hero.2.* / hero.3.* and only appear when they have a title or image.
// Slides auto-advance and slide sideways; arrows + dots allow manual control.
export function HeroBanner({ content }: { content: Record<string, string> }) {
  const c = (k: string, fallback = "") => content[k] ?? fallback;

  const raw: Slide[] = [
    { image: c("hero.image"), badge: c("hero.badge"), title: c("hero.title"), accent: c("hero.titleAccent"), subtitle: c("hero.subtitle") },
    { image: c("hero.2.image"), badge: c("hero.2.badge"), title: c("hero.2.title"), accent: c("hero.2.titleAccent"), subtitle: c("hero.2.subtitle") },
    { image: c("hero.3.image"), badge: c("hero.3.badge"), title: c("hero.3.title"), accent: c("hero.3.titleAccent"), subtitle: c("hero.3.subtitle") },
  ];
  const slides = raw.filter((s, i) => i === 0 || s.image || s.title);
  const n = slides.length;
  const cta1 = c("hero.cta1");
  const cta2 = c("hero.cta2");

  const [idx, setIdx] = useState(0);
  const active = idx % n;

  // Auto-advance.
  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setIdx((v) => (v + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n]);

  const go = (v: number) => setIdx(((v % n) + n) % n);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[62vw] max-h-[680px] min-h-[440px] w-full">
        {/* Sliding track */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div key={i} className="relative h-full w-full shrink-0">
              {s.image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blush via-rose to-blush-deep" />
              )}

              <div className="absolute inset-0">
                <div
                  className={`wrap flex h-full flex-col justify-center gap-5 ${
                    s.image ? "text-white" : "text-foreground"
                  }`}
                >
                  {s.badge && (
                    <span className="w-fit rounded-full bg-white/85 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-rose-deep backdrop-blur">
                      ✦ {s.badge}
                    </span>
                  )}
                  <h1 className="max-w-xl font-display text-4xl leading-[1.05] drop-shadow-sm md:text-6xl lg:text-7xl">
                    {s.title}{" "}
                    <span className={s.image ? "text-blush-deep" : "text-rose-deep"}>
                      {s.accent}
                    </span>
                  </h1>
                  {s.subtitle && (
                    <p
                      className={`max-w-md text-sm leading-relaxed md:text-[15px] ${
                        s.image ? "text-white/85" : "text-foreground/70"
                      }`}
                    >
                      {s.subtitle}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3">
                    <Link
                      href="/shop"
                      className="btn-liquid bg-foreground px-7 py-3.5 text-sm font-medium text-white"
                    >
                      {cta1}
                    </Link>
                    <Link
                      href="/shop?cat=sets"
                      className={`btn-liquid px-7 py-3.5 text-sm font-medium ${
                        s.image
                          ? "border border-white/70 text-white"
                          : "border border-foreground/25 text-foreground"
                      }`}
                    >
                      {cta2}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Arrows + dots (only when there's more than one slide) */}
        {n > 1 && (
          <>
            <button
              onClick={() => go(active - 1)}
              aria-label="Өмнөх"
              className="absolute left-4 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-foreground shadow-lg backdrop-blur transition-colors hover:bg-white lg:left-8"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => go(active + 1)}
              aria-label="Дараах"
              className="absolute right-4 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-foreground shadow-lg backdrop-blur transition-colors hover:bg-white lg:right-8"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Слайд ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? "w-7 bg-white" : "w-2 bg-white/60 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
