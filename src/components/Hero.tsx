import Link from "next/link";
import { GlassCard } from "./Glass";

export function Hero({ content }: { content: Record<string, string> }) {
  const c = (k: string, fallback = "") => content[k] ?? fallback;
  return (
    <section className="relative overflow-hidden px-3 pt-6 lg:px-6">
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-[2.5rem] px-6 py-16 md:grid-cols-2 md:px-12 md:py-24">
        {/* liquid blobs inside hero */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-rose/40 blur-3xl animate-spin-slow" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-lilac/40 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-1/3 h-56 w-56 rounded-full bg-mint/40 blur-3xl" />

        {/* Text */}
        <div className="reveal relative z-10">
          <span className="glass glass-rim inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-rose-deep">
            ✦ {c("hero.badge")}
          </span>
          <h1 className="mt-6 font-display text-[42px] leading-[1.03] tracking-tight sm:text-6xl md:text-5xl lg:text-6xl xl:text-7xl">
            {c("hero.title")}
            <br />
            <span className="text-rose-deep">{c("hero.titleAccent")}</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-foreground/70">
            {c("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/shop"
              className="btn-liquid bg-foreground px-7 py-3.5 text-center text-sm font-medium text-white shadow-[0_12px_30px_-10px_rgba(36,29,27,0.6)]"
            >
              {c("hero.cta1")}
            </Link>
            <Link
              href="/shop?cat=sets"
              className="btn-liquid glass glass-rim px-7 py-3.5 text-center text-sm font-medium text-foreground"
            >
              {c("hero.cta2")}
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-5 text-sm sm:gap-7">
            <Stat value={c("hero.stat1v")} label={c("hero.stat1l")} />
            <span className="h-8 w-px bg-foreground/10" />
            <Stat value={c("hero.stat2v")} label={c("hero.stat2l")} />
            <span className="h-8 w-px bg-foreground/10" />
            <Stat value={c("hero.stat3v")} label={c("hero.stat3l")} />
          </div>
        </div>

        {/* Visual — liquid glass product stage */}
        <div className="relative z-10 mx-auto aspect-[4/5] w-full max-w-sm">
          <GlassCard
            tilt
            className="reveal absolute inset-0 rounded-[2rem]"
            style={{ animationDelay: "120ms" }}
          >
            <div className="absolute inset-0 grid place-items-center">
              {/* glossy product, fully contained */}
              <div className="relative h-[64%] w-[34%]">
                {/* cap */}
                <div className="absolute left-1/2 top-0 h-[15%] w-[44%] -translate-x-1/2 rounded-t-xl bg-foreground/85" />
                {/* body */}
                <div className="absolute inset-x-0 bottom-0 h-[82%] overflow-hidden rounded-[1.6rem] bg-gradient-to-b from-rose via-rose-deep to-plum shadow-[0_30px_60px_-20px_rgba(125,74,92,0.7)]">
                  <div className="absolute left-[20%] top-[12%] h-[58%] w-[8%] rounded-full bg-white/45 blur-[1px]" />
                  <div className="absolute inset-x-3 bottom-4 h-[24%] rounded-lg bg-white/25 backdrop-blur-sm" />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* floating glass tags — clearly separated corners */}
          <GlassCard
            className="reveal absolute -left-3 top-6 rounded-2xl px-4 py-2.5 text-xs"
            style={{ animationDelay: "300ms" }}
          >
            <div className="font-semibold">Velvet Blur тани</div>
            <div className="text-rose-deep">★ 4.9 · 214 сэтгэгдэл</div>
          </GlassCard>
          <GlassCard
            className="reveal absolute -right-3 bottom-6 rounded-2xl px-4 py-2.5 text-xs"
            style={{ animationDelay: "420ms" }}
          >
            <div className="text-muted line-through">52,000₮</div>
            <div className="font-semibold text-rose-deep">42,000₮</div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-xl">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
