import Link from "next/link";

// Full-bleed image banner shown at the top of the home page when an admin
// has uploaded `hero.image`. Falls back to the glass <Hero> otherwise.
export function HeroBanner({ content }: { content: Record<string, string> }) {
  const c = (k: string, fallback = "") => content[k] ?? fallback;
  return (
    <section className="px-3 pt-6 lg:px-6">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={c("hero.image")}
          alt=""
          className="h-[52vw] max-h-[560px] min-h-[320px] w-full object-cover"
        />
        {/* legibility gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center gap-5 p-8 md:p-14 lg:p-16">
          <span className="w-fit rounded-full bg-white/85 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-rose-deep backdrop-blur">
            ✦ {c("hero.badge")}
          </span>
          <h1 className="max-w-lg font-display text-4xl leading-[1.05] text-white drop-shadow md:text-6xl">
            {c("hero.title")}{" "}
            <span className="text-blush-deep">{c("hero.titleAccent")}</span>
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-white/85 drop-shadow md:text-[15px]">
            {c("hero.subtitle")}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="btn-liquid bg-white px-7 py-3.5 text-sm font-medium text-foreground"
            >
              {c("hero.cta1")}
            </Link>
            <Link
              href="/shop?cat=sets"
              className="btn-liquid border border-white/70 px-7 py-3.5 text-sm font-medium text-white"
            >
              {c("hero.cta2")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
