"use client";

// "Trending On Social" — a horizontal, swipeable row of Reel/TikTok cards.
// Admins add any number of links; each card plays its clip inline in a modal.
// The row scrolls sideways when the posts overflow the page width.
import { useEffect, useState } from "react";
import type { TrendingPost } from "@/lib/products";
import { parseEmbed, type ParsedEmbed } from "@/lib/embed";

const accents = ["#f2b7ac", "#f8d9d2", "#cbb6e6", "#bfe3d6", "#e693a0", "#c9a96a"];

export function TrendingSocial({
  posts,
  content,
}: {
  posts: TrendingPost[];
  content: Record<string, string>;
}) {
  const [active, setActive] = useState<ParsedEmbed | null>(null);
  const items = (posts ?? []).filter((p) => parseEmbed(p.url) || p.thumbnail);
  if (items.length === 0) return null;

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

      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:gap-4 md:px-0">
        {items.map((post, i) => {
          const parsed = parseEmbed(post.url);
          return (
            <button
              key={post.id}
              type="button"
              onClick={() => parsed && setActive(parsed)}
              disabled={!parsed}
              className="group relative aspect-[9/16] w-40 shrink-0 snap-start overflow-hidden rounded-2xl sm:w-44 md:w-48 disabled:cursor-default"
              style={
                post.thumbnail
                  ? undefined
                  : {
                      background: `radial-gradient(120% 120% at 30% 22%, #ffffff 0%, ${accents[i % accents.length]}55 60%, ${accents[i % accents.length]} 100%)`,
                    }
              }
            >
              {post.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.thumbnail}
                  alt={post.caption || ""}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              {parsed && (
                <div className="absolute inset-0 grid place-items-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-white/85 shadow-lg backdrop-blur transition-transform duration-300 group-hover:scale-110">
                    <PlayGlyph className="ml-0.5 h-5 w-5 text-rose-deep" />
                  </span>
                </div>
              )}
              {post.caption && (
                <span className="absolute inset-x-0 bottom-0 line-clamp-2 p-3 text-left text-xs font-medium text-white">
                  {post.caption}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {active && (
        <EmbedModal embed={active} onClose={() => setActive(null)} />
      )}
    </section>
  );
}

// A lightbox that plays the selected clip. TikTok/Instagram embeds keep a 9:16
// frame; YouTube gets a 16:9 frame.
function EmbedModal({
  embed,
  onClose,
}: {
  embed: ParsedEmbed;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const portrait = embed.platform !== "youtube";

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl ${
          portrait ? "max-w-[400px] aspect-[9/16]" : "max-w-3xl aspect-video"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={embed.embedUrl}
          className="h-full w-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
          allowFullScreen
          scrolling="no"
        />
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Хаах"
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-lg text-foreground shadow-lg hover:bg-white"
      >
        ✕
      </button>
    </div>
  );
}

function PlayGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
