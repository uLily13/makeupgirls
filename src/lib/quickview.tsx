"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { Product } from "./products";

// Holds the product currently shown in the quick-view popup (null = closed).
type QuickViewContext = {
  product: Product | null;
  open: (p: Product) => void;
  close: () => void;
};

const Ctx = createContext<QuickViewContext | null>(null);

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  const open = useCallback((p: Product) => setProduct(p), []);
  const close = useCallback(() => setProduct(null), []);
  return (
    <Ctx.Provider value={{ product, open, close }}>{children}</Ctx.Provider>
  );
}

export function useQuickView() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useQuickView must be used within QuickViewProvider");
  return ctx;
}
