// "Trending On Social" — a grid of admin-uploaded images (Instagram-style),
// linking to the store's Instagram. Renders only if at least one image is set.
export function TrendingSocial({ content }: { content: Record<string, string> }) {
  const images = [1, 2, 3, 4, 5, 6]
    .map((n) => content[`trending.${n}`])
    .filter(Boolean);
  if (images.length === 0) return null;

  const link = content["social.instagram"] || "#";

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-rose-deep">
          {content["trending.eyebrow"] || "@makeupgirls"}
        </p>
        <h2 className="mt-1 font-display text-3xl">
          {content["trending.title"] || "Trending On Social"}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 md:gap-4">
        {images.map((src, i) => (
          <a
            key={i}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden rounded-2xl bg-blush"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/25 group-hover:opacity-100">
              <span className="text-2xl text-white">♡</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
