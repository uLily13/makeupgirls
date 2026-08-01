"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MNT } from "@/lib/products";
import { ProductVisual } from "./ProductVisual";

export type MiniProduct = {
  slug: string;
  name: string;
  brand: string;
  price: number;
  shade: string;
  image?: string;
};

const KEY = "makeupgirls_recent";

function read(): MiniProduct[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

/** Records the given product as recently viewed (call on product pages). */
export function TrackRecentlyViewed({ product }: { product: MiniProduct }) {
  useEffect(() => {
    const list = read().filter((p) => p.slug !== product.slug);
    list.unshift(product);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 12)));
  }, [product]);
  return null;
}

/** Renders the recently-viewed strip, optionally excluding one slug. */
export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const [items, setItems] = useState<MiniProduct[]>([]);
  useEffect(() => {
    setItems(read().filter((p) => p.slug !== exclude).slice(0, 6));
  }, [exclude]);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <h2 className="mb-6 font-display text-2xl">Сүүлд үзсэн</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 lg:grid-cols-6">
        {items.map((p) => (
          <Link key={p.slug} href={`/product/${p.slug}`} className="group flex flex-col">
            <div className="squish aspect-[4/5] overflow-hidden rounded-2xl bg-blush">
              <ProductVisual
                shade={p.shade}
                image={p.image}
                className="h-full w-full transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <span className="mt-2 truncate text-sm font-medium">{p.name}</span>
            <span className="text-sm text-muted">{MNT(p.price)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
