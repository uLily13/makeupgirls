import Link from "next/link";
import { Hero } from "@/components/Hero";
import { HeroBanner } from "@/components/HeroBanner";
import { TrendingSocial } from "@/components/TrendingSocial";
import { ProductCard } from "@/components/ProductCard";
import { ProductVisual } from "@/components/ProductVisual";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { getStore, resolveContent, visibleCategories, withRatings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = await getStore();
  const content = resolveContent(store);
  const cats = visibleCategories(store);
  const prods = withRatings(store);

  const bestSellers = prods.filter((p) => p.badge === "Хит").slice(0, 4);
  const newArrivals = prods.filter((p) => p.badge === "Шинэ").slice(0, 4);
  const c = (k: string, fallback = "") => content[k] ?? fallback;

  return (
    <>
      {content["hero.image"] ? (
        <HeroBanner content={content} />
      ) : (
        <Hero content={content} />
      )}

      {/* Category strip */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-rose-deep">
              {c("home.cat.eyebrow")}
            </p>
            <h2 className="mt-1 font-display text-3xl">{c("home.cat.title")}</h2>
          </div>
          <Link href="/shop" className="link-underline text-sm font-medium">
            Бүгдийг үзэх →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-5">
          {cats.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?cat=${cat.slug}`}
              className="group flex flex-col items-center gap-3"
            >
              <div className="squish grid aspect-square w-full place-items-center overflow-hidden rounded-full bg-blush shadow-[0_14px_34px_-20px_rgba(125,74,92,0.6)] transition-transform duration-500 group-hover:scale-105">
                <ProductVisual shade={cat.accent} className="h-full w-full" />
              </div>
              <span className="text-center text-sm font-medium">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-rose-deep">
                {c("home.best.eyebrow")}
              </p>
              <h2 className="mt-1 font-display text-3xl">
                {c("home.best.title")}
              </h2>
            </div>
            <Link href="/shop" className="link-underline text-sm font-medium">
              Бүгдийг үзэх →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-6">
            {bestSellers.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Editorial banner */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl bg-foreground text-white md:grid-cols-2">
          <div className="flex flex-col justify-center gap-5 p-10 md:p-14">
            <span className="text-xs uppercase tracking-[0.25em] text-white/50">
              {c("edito.eyebrow")}
            </span>
            <h3 className="font-display text-3xl leading-tight md:text-4xl">
              {c("edito.title")}
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-white/70">
              {c("edito.body")}
            </p>
            <Link
              href="/shop?cat=skincare"
              className="mt-2 w-fit rounded-full bg-white px-7 py-3 text-sm font-medium text-foreground transition-transform hover:scale-[1.03]"
            >
              {c("edito.cta")}
            </Link>
          </div>
          <div className="relative min-h-64 bg-gradient-to-br from-rose/40 via-blush-deep/30 to-transparent">
            <div className="absolute inset-0 grid grid-cols-2 gap-4 p-8">
              {["#cfe6dc", "#f3e3d0", "#e69ba0", "#d98f97"].map((col, i) => (
                <div
                  key={i}
                  className="rounded-2xl shadow-xl"
                  style={{
                    background: `linear-gradient(160deg, ${col}, rgba(0,0,0,0.15))`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-rose-deep">
                {c("home.new.eyebrow")}
              </p>
              <h2 className="mt-1 font-display text-3xl">
                {c("home.new.title")}
              </h2>
            </div>
            <Link href="/shop" className="link-underline text-sm font-medium">
              Бүгдийг үзэх →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-6">
            {newArrivals.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Trending on social */}
      <TrendingSocial content={content} />

      {/* Recently viewed (client, from localStorage) */}
      <RecentlyViewed />

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="glass glass-rim grid gap-6 rounded-[2rem] p-8 sm:grid-cols-2 md:grid-cols-4 md:p-10">
          {[
            { t: c("vp1.t"), d: c("vp1.d"), i: "🚚" },
            { t: c("vp2.t"), d: c("vp2.d"), i: "✓" },
            { t: c("vp3.t"), d: c("vp3.d"), i: "💳" },
            { t: c("vp4.t"), d: c("vp4.d"), i: "↺" },
          ].map((v) => (
            <div key={v.t} className="flex flex-col gap-2">
              <div className="glass glass-rim grid h-11 w-11 place-items-center rounded-full text-lg">
                {v.i}
              </div>
              <div className="mt-1 font-medium">{v.t}</div>
              <div className="text-sm text-muted">{v.d}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
