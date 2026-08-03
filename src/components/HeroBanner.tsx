import Link from "next/link";

// Large, full-bleed image banner at the top of the home page (Judydoll-style).
// When an admin has uploaded `hero.image` it fills the banner; otherwise a
// soft coral gradient keeps the big hero section present.
export function HeroBanner({ content }: { content: Record<string, string> }) {
  const c = (k: string, fallback = "") => content[k] ?? fallback;
  const image = c("hero.image");

  return (
    <section className="relative w-full">
      <div className="relative h-[62vw] max-h-[680px] min-h-[440px] w-full overflow-hidden">
        {image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* legibility gradient over the photo */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
          </>
        ) : (
          // No photo yet — a rich coral gradient still gives a big hero section.
          <div className="absolute inset-0 bg-gradient-to-br from-blush via-rose to-blush-deep" />
        )}

        {/* Content */}
        <div className="absolute inset-0">
          <div
            className={`mx-auto flex h-full max-w-7xl flex-col justify-center gap-5 px-6 md:px-10 lg:px-16 ${
              image ? "text-white" : "text-foreground"
            }`}
          >
            <span
              className={`w-fit rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] backdrop-blur ${
                image
                  ? "bg-white/85 text-rose-deep"
                  : "bg-white/70 text-rose-deep"
              }`}
            >
              ✦ {c("hero.badge")}
            </span>
            <h1 className="max-w-xl font-display text-4xl leading-[1.05] drop-shadow-sm md:text-6xl lg:text-7xl">
              {c("hero.title")}{" "}
              <span className={image ? "text-blush-deep" : "text-rose-deep"}>
                {c("hero.titleAccent")}
              </span>
            </h1>
            <p
              className={`max-w-md text-sm leading-relaxed md:text-[15px] ${
                image ? "text-white/85" : "text-foreground/70"
              }`}
            >
              {c("hero.subtitle")}
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="btn-liquid bg-foreground px-7 py-3.5 text-sm font-medium text-white"
              >
                {c("hero.cta1")}
              </Link>
              <Link
                href="/shop?cat=sets"
                className={`btn-liquid px-7 py-3.5 text-sm font-medium ${
                  image
                    ? "border border-white/70 text-white"
                    : "border border-foreground/25 text-foreground"
                }`}
              >
                {c("hero.cta2")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
