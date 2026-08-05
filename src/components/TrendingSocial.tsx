"use client";

// "Trending On Social" — a horizontal, swipeable row of Reel/TikTok cards that
// play inline, right on the page. Each clip autoplays muted and loops (like a
// social feed); the row scrolls sideways when the posts overflow and gently
// auto-advances. Admins add any number of links.
import type { TrendingPost } from "@/lib/products";
import { parseEmbed, embedPlayerSrc } from "@/lib/embed";
import { AutoScroller } from "./AutoScroller";

const accents = ["#f2b7ac", "#f8d9d2", "#cbb6e6", "#bfe3d6", "#e693a0", "#c9a96a"];

export function TrendingSocial({
  posts,
  content,
}: {
  posts: TrendingPost[];
  content: Record<string, string>;
}) {
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

      <AutoScroller
        interval={5600}
        className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:gap-4 md:px-0"
      >
        {items.map((post, i) => {
          const parsed = parseEmbed(post.url);
          return (
            <div
              key={post.id}
              className="relative aspect-[9/16] w-52 shrink-0 snap-start overflow-hidden rounded-2xl bg-black sm:w-56 md:w-60"
              style={
                parsed
                  ? undefined
                  : {
                      background: `radial-gradient(120% 120% at 30% 22%, #ffffff 0%, ${accents[i % accents.length]}55 60%, ${accents[i % accents.length]} 100%)`,
                    }
              }
            >
              {parsed ? (
                <iframe
                  src={embedPlayerSrc(parsed, { autoplay: true })}
                  title={post.caption || "Trending video"}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture; clipboard-write; fullscreen"
                  allowFullScreen
                  loading="lazy"
                  scrolling="no"
                />
              ) : (
                post.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.thumbnail}
                    alt={post.caption || ""}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )
              )}
              {post.caption && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/55 to-transparent p-3 text-left text-xs font-medium text-white">
                  {post.caption}
                </span>
              )}
            </div>
          );
        })}
      </AutoScroller>
    </section>
  );
}
