"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { Category, Subcategory, Product } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import {
  dominantColorFromFile,
  distanceToSwatches,
  hexToRgb,
} from "@/lib/color";

type Sort = "featured" | "price-asc" | "price-desc" | "rating";

// All swatch hexes for a product (primary shade + colour variants).
const swatchesOf = (p: Product): string[] => [
  p.shade,
  ...(p.colors ?? []).map((c) => c.hex),
];

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

  // Free-text search — seeded from the ?q= param (e.g. from the nav search),
  // then editable locally. When the URL's q changes (a fresh nav search while
  // already on /shop), re-sync during render without an effect.
  const qParam = params.get("q") ?? "";
  const [search, setSearch] = useState(qParam);
  const [prevQParam, setPrevQParam] = useState(qParam);
  if (qParam !== prevQParam) {
    setPrevQParam(qParam);
    setSearch(qParam);
  }
  const q = search.trim().toLowerCase();

  // Image ("search by colour"): the uploaded photo's dominant colour, seeded
  // from ?color=RRGGBB (e.g. from the nav search). Products are ranked by how
  // close their swatches are to this colour.
  const colorParam = params.get("color");
  const initColor = colorParam ? `#${colorParam.replace(/^#/, "")}` : null;
  const [colorHex, setColorHex] = useState<string | null>(initColor);
  const [prevColorParam, setPrevColorParam] = useState(colorParam);
  if (colorParam !== prevColorParam) {
    setPrevColorParam(colorParam);
    setColorHex(initColor);
  }
  const [colorBusy, setColorBusy] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    setColorBusy(true);
    try {
      const hex = await dominantColorFromFile(file);
      setColorHex(hex);
    } catch {
      /* ignore unreadable image */
    } finally {
      setColorBusy(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

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
    if (q) {
      l = l.filter((p) =>
        `${p.name} ${p.brand} ${p.short} ${p.description} ${p.subcategory} ${(p.ingredients ?? []).join(" ")}`
          .toLowerCase()
          .includes(q)
      );
    }
    l = [...l];
    const target = colorHex ? hexToRgb(colorHex) : null;
    if (target) {
      // Colour search overrides the sort — closest swatch first.
      l.sort(
        (a, b) =>
          distanceToSwatches(target, swatchesOf(a)) -
          distanceToSwatches(target, swatchesOf(b))
      );
    } else {
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
    }
    return l;
  }, [cat, sub, sort, q, colorHex, products]);

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

      {/* Search bar */}
      <div className="relative mb-6">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Бүтээгдэхүүн, брэнд, найрлагаар хайх…"
          className="w-full rounded-full border border-line bg-surface py-3 pl-11 pr-24 text-sm focus:border-rose focus:outline-none"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Цэвэрлэх"
              className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-blush hover:text-rose-deep"
            >
              ✕
            </button>
          )}
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={colorBusy}
            title="Зургаар (өнгөөр) хайх"
            aria-label="Зургаар хайх"
            className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-blush hover:text-rose-deep disabled:opacity-50"
          >
            {colorBusy ? (
              "…"
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="8.5" cy="10" r="1.6" fill="currentColor" />
                <path d="M4 17l5-4 4 3 3-2 4 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => pickImage(e.target.files?.[0])}
        />
      </div>

      {/* Colour-search banner */}
      {colorHex && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-line bg-blush/40 px-4 py-3">
          <span
            className="h-8 w-8 shrink-0 rounded-full border border-white shadow-inner"
            style={{ background: colorHex }}
          />
          <div className="min-w-0 flex-1 text-sm">
            <span className="font-medium">Өнгөөр хайлт</span>
            <span className="ml-2 text-muted">
              Энэ өнгөнд ойрхон бүтээгдэхүүнүүд эхэлж харагдана
            </span>
          </div>
          <button
            onClick={() => setColorHex(null)}
            className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium hover:border-rose hover:text-rose-deep"
          >
            Болих ✕
          </button>
        </div>
      )}

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
          <span className="hidden text-muted sm:inline">
            {colorHex ? "Өнгөөр эрэмбэлсэн" : "Эрэмбэлэх:"}
          </span>
          <select
            value={colorHex ? "featured" : sort}
            disabled={!!colorHex}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border border-line bg-surface px-4 py-2 text-sm focus:border-rose focus:outline-none disabled:opacity-50"
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
            {q
              ? `«${search.trim()}» — илэрц олдсонгүй`
              : `${activeSub?.name ?? "Энэ ангилал"} — удахгүй нэмэгдэнэ ✦`}
          </p>
          <button
            onClick={() => {
              setSearch("");
              go("all");
            }}
            className="rounded-full border border-line bg-surface px-6 py-2.5 text-sm font-medium hover:border-rose hover:text-rose-deep"
          >
            Бүх бүтээгдэхүүн үзэх
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
