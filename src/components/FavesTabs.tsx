"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { AutoScroller } from "./AutoScroller";

// "Choose Your Faves"-style tabbed section: switch between best sellers and
// bundles (Judydoll layout — centred title, underline tabs, product grid).
export function FavesTabs({
  eyebrow,
  title,
  tab1,
  tab2,
  best,
  bundles,
}: {
  eyebrow: string;
  title: string;
  tab1: string;
  tab2: string;
  best: Product[];
  bundles: Product[];
}) {
  const [tab, setTab] = useState<"best" | "bundle">("best");
  const list = tab === "best" ? best : bundles;
  // If there are no bundles, don't offer the empty tab.
  const showBundleTab = bundles.length > 0;

  return (
    <div>
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-rose-deep">
          {eyebrow}
        </p>
        <h2 className="relative mt-1.5 inline-block font-display text-3xl md:text-4xl">
          {title}
          <span className="absolute -bottom-2 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-rose" />
        </h2>
      </div>

      {/* Tabs */}
      <div className="mb-9 flex items-center justify-center gap-8">
        <TabBtn active={tab === "best"} onClick={() => setTab("best")}>
          {tab1}
        </TabBtn>
        {showBundleTab && (
          <TabBtn active={tab === "bundle"} onClick={() => setTab("bundle")}>
            {tab2}
          </TabBtn>
        )}
      </div>

      {list.length > 0 ? (
        <AutoScroller className="no-scrollbar -mx-4 flex snap-x gap-x-5 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {list.map((p) => (
            <div
              key={p.slug}
              className="w-44 shrink-0 snap-start sm:w-52 md:w-56 xl:w-60"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </AutoScroller>
      ) : (
        <p className="py-10 text-center text-muted">Удахгүй нэмэгдэнэ ✦</p>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/shop"
          className="btn-liquid inline-block bg-foreground px-9 py-3.5 text-sm font-medium text-white"
        >
          Бүгдийг үзэх
        </Link>
      </div>
    </div>
  );
}

function TabBtn({
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
      className={`relative pb-2 text-lg font-medium transition-colors ${
        active ? "text-foreground" : "text-muted hover:text-foreground"
      }`}
    >
      {children}
      <span
        className={`absolute -bottom-px left-0 h-0.5 w-full rounded-full bg-foreground transition-transform duration-300 ${
          active ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </button>
  );
}
