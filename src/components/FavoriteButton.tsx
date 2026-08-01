"use client";

import { useFavorites } from "@/lib/favorites";

export function FavoriteButton({ slug }: { slug: string }) {
  const { has, toggle } = useFavorites();
  const fav = has(slug);
  return (
    <button
      onClick={() => toggle(slug)}
      className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-rose hover:text-rose-deep"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill={fav ? "var(--rose-deep)" : "none"}>
        <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0112 5a4.5 4.5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z" stroke={fav ? "var(--rose-deep)" : "currentColor"} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      {fav ? "Хадгалсан" : "Хадгалах"}
    </button>
  );
}
