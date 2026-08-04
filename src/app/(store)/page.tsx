import Link from "next/link";
import { HeroBanner } from "@/components/HeroBanner";
import { FavesTabs } from "@/components/FavesTabs";
import { TrendingSocial } from "@/components/TrendingSocial";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { getStore, resolveContent, visibleCategories, withRatings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = await getStore();
  const content = resolveContent(store);
  const cats = visibleCategories(store);
  const prods = withRatings(store);

  const bestSellers = prods.filter((p) => p.badge === "Хит").slice(0, 10);
  const bundles = prods
    .filter((p) => p.bundle || p.category === "sets")
    .slice(0, 10);
  const newArrivals = prods.filter((p) => p.badge === "Шинэ").slice(0, 5);
  const c = (k: string, fallback = "") => content[k] ?? fallback;

  return (
    <>
      {/* Large full-bleed hero carousel */}
      <HeroBanner
        slides={store.heroSlides ?? []}
        cta1={c("hero.cta1", "Одоо худалдаж авах")}
        cta2={c("hero.cta2", "Багц үзэх")}
      />

      {/* Faves — best sellers & bundles as tabs */}
      <SectionBand bg={c("home.faves.bg")}>
        <FavesTabs
          eyebrow={c("home.faves.eyebrow")}
          title={c("home.faves.title")}
          tab1={c("home.faves.tab1", "Хит бүтээгдэхүүн")}
          tab2={c("home.faves.tab2", "Багц")}
          best={bestSellers}
          bundles={bundles}
        />
      </SectionBand>

      {/* Categories (below the faves section) */}
      <SectionBand bg={c("home.cat.bg")} base="bg-blush/60">
        <SectionHead eyebrow={c("home.cat.eyebrow")} title={c("home.cat.title")} />
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {cats.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?cat=${cat.slug}`}
              className="card-hover group relative block aspect-[4/5] w-40 shrink-0 snap-start overflow-hidden rounded-3xl sm:w-48 lg:w-52"
            >
              {cat.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cat.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              ) : (
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  style={{
                    background: `radial-gradient(120% 120% at 30% 22%, #ffffff 0%, ${cat.accent}66 55%, ${cat.accent} 100%)`,
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-plum/65 via-plum/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="font-display text-lg leading-tight text-white">
                  {cat.name}
                </div>
                <div className="mt-0.5 line-clamp-1 text-[11px] text-white/80">
                  {cat.tagline}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SectionBand>

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <SectionBand bg={c("home.new.bg")}>
          <SectionHead
            eyebrow={c("home.new.eyebrow")}
            title={c("home.new.title")}
          />
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4 md:gap-7 xl:grid-cols-5">
            {newArrivals.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </SectionBand>
      )}

      {/* Trending on social */}
      <TrendingSocial posts={store.trendingPosts ?? []} content={content} />

      {/* Recently viewed (client, from localStorage) */}
      <RecentlyViewed />

      {/* Value props */}
      <SectionBand bg={c("home.vp.bg")}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: c("vp1.t"), d: c("vp1.d"), i: "🚚" },
            { t: c("vp2.t"), d: c("vp2.d"), i: "✓" },
            { t: c("vp3.t"), d: c("vp3.d"), i: "💳" },
            { t: c("vp4.t"), d: c("vp4.d"), i: "↺" },
          ].map((v) => (
            <div
              key={v.t}
              className="flex flex-col gap-3 rounded-3xl bg-blush/60 p-7"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl shadow-[0_10px_24px_-16px_rgba(125,74,92,0.6)]">
                {v.i}
              </div>
              <div className="mt-1 font-medium">{v.t}</div>
              <div className="text-sm text-muted">{v.d}</div>
            </div>
          ))}
        </div>
      </SectionBand>
    </>
  );
}

// A full-bleed home section. When `bg` (an image URL) is set it becomes the
// section background with a light overlay so text stays readable; otherwise the
// `base` class (e.g. a coral tint) is used. Content sits in a wide container.
function SectionBand({
  bg,
  base = "",
  pad = "py-16 lg:py-24",
  children,
}: {
  bg?: string;
  base?: string;
  pad?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`relative ${bg ? "" : base}`}>
      {bg && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${bg}")` }}
          />
          <div className="absolute inset-0 bg-white/78" />
        </>
      )}
      <div className={`relative wrap ${pad}`}>{children}</div>
    </section>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-9 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-rose-deep">
          {eyebrow}
        </p>
        <h2 className="mt-1.5 font-display text-3xl md:text-4xl">{title}</h2>
      </div>
      <Link href="/shop" className="link-underline shrink-0 text-sm font-medium">
        Бүгдийг үзэх →
      </Link>
    </div>
  );
}
