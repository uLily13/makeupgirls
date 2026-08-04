"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Category, Subcategory, Product } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

type Sort = "featured" | "price-asc" | "price-desc" | "rating";

export function ShopClient({
  categories,
  subcategories,
  products,
}: {
  categories: Category[];
  subcategories: Subcategory[];
  products: Product[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const cat = params.get("cat") ?? "all";
  const sub = params.get("sub") ?? "";
  const [sort, setSort] = useState<Sort>("featured");

  const activeCat = categories.find((c) => c.slug === cat);
  const activeSub = subcategories.find((s) => s.slug === sub);
  const subs =
    cat !== "all" ? subcategories.filter((s) => s.category === cat) : [];
  const countBySubcategory = (slug: string) =>
    products.filter((p) => p.subcategory === slug).length;

  const list = useMemo(() => {
    let l =
      cat === "all" ? products : products.filter((p) => p.category === cat);
    if (sub) l = l.filter((p) => p.subcategory === sub);
    l = [...l];
    switch (sort) {
      case "price-asc":
        l.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        l.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        l.sort((a, b) => b.rating - a.rating);
        break;
    }
    return l;
  }, [cat, sub, sort]);

  const go = (nextCat: string, nextSub = "") => {
    const p = new URLSearchParams();
    if (nextCat !== "all") p.set("cat", nextCat);
    if (nextSub) p.set("sub", nextSub);
    const qs = p.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  };

  return (
    <div className="wrap py-10 lg:py-14">
      {/* Header */}
      <div className="mb-8 border-b border-line pb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-rose-deep">
          {activeSub ? activeCat?.name : "Дэлгүүр"}
        </p>
        <h1 className="mt-2 font-display text-4xl">
          {activeSub
            ? activeSub.name
            : activeCat
              ? activeCat.name
              : "Бүх бүтээгдэхүүн"}
        </h1>
        <p className="mt-2 text-muted">
          {activeSub
            ? `${activeCat?.name} · дэд ангилал`
            : activeCat
              ? activeCat.tagline
              : "Гоо сайхны бүх бүтээгдэхүүн нэг дороос"}
        </p>
      </div>

      {/* Category chips */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        <Chip active={cat === "all"} onClick={() => go("all")}>
          Бүгд
        </Chip>
        {categories.map((c) => (
          <Chip key={c.slug} active={cat === c.slug} onClick={() => go(c.slug)}>
            {c.name}
          </Chip>
        ))}
      </div>

      {/* Subcategory chips — only when a category is selected */}
      {subs.length > 0 && (
        <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
          <SubChip active={!sub} onClick={() => go(cat)}>
            Бүгд
          </SubChip>
          {subs.map((s) => {
            const n = countBySubcategory(s.slug);
            return (
              <SubChip
                key={s.slug}
                active={sub === s.slug}
                muted={n === 0}
                onClick={() => go(cat, s.slug)}
              >
                {s.name}
                {n > 0 && (
                  <span className="ml-1.5 text-[11px] opacity-60">{n}</span>
                )}
              </SubChip>
            );
          })}
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <span className="whitespace-nowrap text-sm text-muted">
          {list.length} бүтээгдэхүүн
        </span>
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden text-muted sm:inline">Эрэмбэлэх:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border border-line bg-surface px-4 py-2 text-sm focus:border-rose focus:outline-none"
          >
            <option value="featured">Онцлох</option>
            <option value="price-asc">Үнэ: багаас их</option>
            <option value="price-desc">Үнэ: ихээс бага</option>
            <option value="rating">Үнэлгээ</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-muted">
            {activeSub?.name ?? "Энэ ангилал"} — удахгүй нэмэгдэнэ ✦
          </p>
          <button
            onClick={() => go(cat)}
            className="rounded-full border border-line bg-surface px-6 py-2.5 text-sm font-medium hover:border-rose hover:text-rose-deep"
          >
            {activeCat?.name ?? "Бүх"} бүтээгдэхүүн үзэх
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 md:gap-7 lg:grid-cols-4 xl:grid-cols-5">
          {list.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-foreground text-white"
          : "bg-blush/70 text-foreground/70 hover:bg-rose/40 hover:text-rose-deep"
      }`}
    >
      {children}
    </button>
  );
}

function SubChip({
  active,
  muted = false,
  onClick,
  children,
}: {
  active: boolean;
  muted?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-[13px] transition-colors ${
        active
          ? "border-rose bg-rose/15 font-medium text-rose-deep"
          : muted
            ? "border-line text-muted/60 hover:text-muted"
            : "border-line text-foreground/70 hover:border-rose hover:text-rose-deep"
      }`}
    >
      {children}
    </button>
  );
}
