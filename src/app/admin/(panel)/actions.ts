"use server";

import { revalidatePath } from "next/cache";
import { getStore, saveStore } from "@/lib/db";
import type { Product, Category, Subcategory } from "@/lib/products";

// NOTE: These are public POST endpoints. Before production, gate every action
// behind authentication/authorization (see the admin login TODO).

function refresh() {
  // Root-layout revalidation refreshes both the storefront and the admin.
  revalidatePath("/", "layout");
}

const now = () => new Date().toISOString();

// ============================ PRODUCTS ============================

export type ProductInput = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  oldPrice?: number | null;
  rating?: number;
  reviews?: number;
  shade: string;
  badge?: Product["badge"] | "";
  short: string;
  description: string;
  ingredients?: string[];
};

export async function saveProduct(input: ProductInput) {
  const store = await getStore();
  const idx = store.products.findIndex((p) => p.slug === input.slug);
  const badge = input.badge ? (input.badge as Product["badge"]) : undefined;

  if (idx === -1) {
    // create
    const product: Product = {
      slug: input.slug,
      name: input.name,
      brand: input.brand,
      category: input.category,
      subcategory: input.subcategory,
      price: input.price,
      oldPrice: input.oldPrice ?? undefined,
      rating: input.rating ?? 5,
      reviews: input.reviews ?? 0,
      shade: input.shade,
      badge,
      short: input.short,
      description: input.description,
      ingredients: input.ingredients ?? [],
      hidden: false,
      priceHistory: [{ at: now(), from: null, to: input.price, note: "Анхны үнэ" }],
    };
    store.products.push(product);
  } else {
    const p = store.products[idx];
    // Log a price change if the price moved.
    if (p.price !== input.price) {
      p.priceHistory = p.priceHistory ?? [];
      p.priceHistory.push({ at: now(), from: p.price, to: input.price, note: "Үнэ шинэчлэл" });
    }
    Object.assign(p, {
      name: input.name,
      brand: input.brand,
      category: input.category,
      subcategory: input.subcategory,
      price: input.price,
      oldPrice: input.oldPrice ?? undefined,
      rating: input.rating ?? p.rating,
      reviews: input.reviews ?? p.reviews,
      shade: input.shade,
      badge,
      short: input.short,
      description: input.description,
      ingredients: input.ingredients ?? p.ingredients,
    });
  }
  await saveStore(store);
  refresh();
}

export async function deleteProduct(slug: string) {
  const store = await getStore();
  store.products = store.products.filter((p) => p.slug !== slug);
  await saveStore(store);
  refresh();
}

export async function toggleProductHidden(slug: string) {
  const store = await getStore();
  const p = store.products.find((x) => x.slug === slug);
  if (p) p.hidden = !p.hidden;
  await saveStore(store);
  refresh();
}

/** Start a promotion: keep current price as compare-at, sell at salePrice. */
export async function startPromotion(slug: string, salePrice: number) {
  const store = await getStore();
  const p = store.products.find((x) => x.slug === slug);
  if (p && salePrice > 0 && salePrice < p.price) {
    p.oldPrice = p.price;
    p.priceHistory = p.priceHistory ?? [];
    p.priceHistory.push({ at: now(), from: p.price, to: salePrice, note: "Урамшуулал зарлав" });
    p.price = salePrice;
    p.badge = "Хямдрал";
  }
  await saveStore(store);
  refresh();
}

/** End a promotion: restore compare-at price. */
export async function endPromotion(slug: string) {
  const store = await getStore();
  const p = store.products.find((x) => x.slug === slug);
  if (p && p.oldPrice) {
    p.priceHistory = p.priceHistory ?? [];
    p.priceHistory.push({ at: now(), from: p.price, to: p.oldPrice, note: "Урамшуулал дуусгав" });
    p.price = p.oldPrice;
    p.oldPrice = undefined;
    if (p.badge === "Хямдрал") p.badge = undefined;
  }
  await saveStore(store);
  refresh();
}

// ============================ CATEGORIES ============================

export async function saveCategory(input: Category) {
  const store = await getStore();
  const idx = store.categories.findIndex((c) => c.slug === input.slug);
  if (idx === -1) store.categories.push({ ...input });
  else Object.assign(store.categories[idx], input);
  await saveStore(store);
  refresh();
}

export async function toggleCategoryHidden(slug: string) {
  const store = await getStore();
  const c = store.categories.find((x) => x.slug === slug);
  if (c) c.hidden = !c.hidden;
  await saveStore(store);
  refresh();
}

export async function deleteCategory(slug: string) {
  const store = await getStore();
  const hasProducts = store.products.some((p) => p.category === slug);
  if (hasProducts) {
    throw new Error("Энэ ангилалд бүтээгдэхүүн байгаа тул устгах боломжгүй. Эхлээд нуух эсвэл бүтээгдэхүүнийг зөөнө үү.");
  }
  store.categories = store.categories.filter((c) => c.slug !== slug);
  store.subcategories = store.subcategories.filter((s) => s.category !== slug);
  await saveStore(store);
  refresh();
}

// ============================ SUBCATEGORIES ============================

export async function saveSubcategory(input: Subcategory) {
  const store = await getStore();
  const idx = store.subcategories.findIndex((s) => s.slug === input.slug);
  if (idx === -1) store.subcategories.push({ ...input });
  else Object.assign(store.subcategories[idx], input);
  await saveStore(store);
  refresh();
}

export async function toggleSubcategoryHidden(slug: string) {
  const store = await getStore();
  const s = store.subcategories.find((x) => x.slug === slug);
  if (s) s.hidden = !s.hidden;
  await saveStore(store);
  refresh();
}

export async function deleteSubcategory(slug: string) {
  const store = await getStore();
  const hasProducts = store.products.some((p) => p.subcategory === slug);
  if (hasProducts) {
    throw new Error("Энэ дэд ангилалд бүтээгдэхүүн байгаа тул устгах боломжгүй.");
  }
  store.subcategories = store.subcategories.filter((s) => s.slug !== slug);
  await saveStore(store);
  refresh();
}

// ============================ CONTENT ============================

export async function updateContent(key: string, value: string) {
  const store = await getStore();
  const item = store.content.find((c) => c.key === key);
  if (item && item.value !== value) {
    item.history = item.history ?? [];
    // Keep the previous value in history (most recent first).
    item.history.unshift({ value: item.value, at: now() });
    item.value = value;
  }
  await saveStore(store);
  refresh();
}

export async function restoreContent(key: string, historyIndex: number) {
  const store = await getStore();
  const item = store.content.find((c) => c.key === key);
  if (item && item.history && item.history[historyIndex]) {
    const restored = item.history[historyIndex].value;
    item.history.unshift({ value: item.value, at: now() });
    item.value = restored;
  }
  await saveStore(store);
  refresh();
}
