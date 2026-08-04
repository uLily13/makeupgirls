// "Trending On Social" — an Instagram-style grid linking to the store's IG.
// Always visible (Judydoll-style); admin-uploaded photos fill the tiles, and
// empty slots show a soft coral placeholder so the section still reads well.
export function TrendingSocial({ content }: { content: Record<string, string> }) {
  const slots = [1, 2, 3, 4, 5, 6].map((n) => content[`trending.${n}`] || "");
  const link = content["social.instagram"] || "#";
  const accents = ["#f2b7ac", "#f8d9d2", "#cbb6e6", "#bfe3d6", "#e693a0", "#c9a96a"];

  return (
    <section className="wrap py-16 lg:py-24">
      <div className="mb-9 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-rose-deep">
          {content["trending.eyebrow"] || "@makeupgirls"}
        </p>
        <h2 className="relative mt-1.5 inline-block font-display text-3xl md:text-4xl">
          {content["trending.title"] || "Trending On Social"}
          <span className="absolute -bottom-2 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-rose" />
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 md:gap-4">
        {slots.map((src, i) => (
          <a
            key={i}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden rounded-2xl"
            style={
              src
                ? undefined
                : {
                    background: `radial-gradient(120% 120% at 30% 22%, #ffffff 0%, ${accents[i]}55 60%, ${accents[i]} 100%)`,
                  }
            }
          >
            {src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/25 group-hover:opacity-100">
              <InstagramGlyph className="h-7 w-7 text-white" />
            </div>
            {!src && (
              <InstagramGlyph className="absolute bottom-3 right-3 h-5 w-5 text-white/70" />
            )}
          </a>
        ))}
      </div>
    </section>
  );
}

function InstagramGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
    </svg>
  );
}
