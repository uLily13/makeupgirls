"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Site-wide campaign banner (Black Friday style). Shows the promo title, the
// discount and a live countdown to `endsAt` (end of that day). Rendered by the
// store layout only when a live promotion has `banner: true`.
export function PromoBanner({
  title,
  discountLabel,
  endsAt,
  color,
}: {
  title: string;
  discountLabel: string;
  endsAt?: string;
  color: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  const target = endsAt ? new Date(`${endsAt}T23:59:59`).getTime() : null;
  const rem = target != null && now != null ? Math.max(0, target - now) : null;

  const totalSec = rem != null ? Math.floor(rem / 1000) : 0;
  const parts = [
    { v: Math.floor(totalSec / 86400), l: "Өдөр" },
    { v: Math.floor((totalSec % 86400) / 3600), l: "Цаг" },
    { v: Math.floor((totalSec % 3600) / 60), l: "Мин" },
    { v: totalSec % 60, l: "Сек" },
  ];
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{ background: color }} className="w-full text-white">
      <div className="wrap flex flex-wrap items-center justify-center gap-x-6 gap-y-3 py-4 text-center md:py-5">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl leading-none md:text-2xl">
            {title}
          </span>
          <span className="rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide md:text-sm">
            {discountLabel}
          </span>
        </div>

        {rem != null && (
          <div className="flex items-center gap-2">
            {parts.map((p, i) => (
              <span key={p.l} className="flex items-center gap-2">
                <span className="flex min-w-[3rem] flex-col items-center rounded-lg bg-white/15 px-2 py-1">
                  <span className="font-mono text-lg font-bold leading-none tabular-nums md:text-xl">
                    {now == null ? "––" : pad(p.v)}
                  </span>
                  <span className="mt-0.5 text-[10px] uppercase tracking-wider text-white/70">
                    {p.l}
                  </span>
                </span>
                {i < parts.length - 1 && (
                  <span className="text-lg font-bold text-white/50">:</span>
                )}
              </span>
            ))}
          </div>
        )}

        <Link
          href="/shop"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-foreground transition-transform hover:scale-[1.03]"
        >
          Дэлгүүр үзэх →
        </Link>
      </div>
    </div>
  );
}
