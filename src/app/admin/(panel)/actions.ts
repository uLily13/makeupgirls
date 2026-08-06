"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getStore, saveStore } from "@/lib/db";
import type {
  Product,
  Category,
  Subcategory,
  ColorVariant,
  Promotion,
  OrderStatus,
  HeroSlide,
  TrendingPost,
  BadgeType,
  BadgeSettings,
  PopupSlide,
} from "@/lib/products";

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
  shade: string;
  colors: ColorVariant[];
  images: string[];
  stock: number;
  usage: string;
  badges?: BadgeType[];
  bundle?: boolean;
  code?: string;
  barcode?: string;
  short: string;
  description: string;
  ingredients?: string[];
};

export async function saveProduct(input: ProductInput) {
  const store = await getStore();
  const idx = store.products.findIndex((p) => p.slug === input.slug);
  const badges = (input.badges ?? []).filter(
    (b): b is BadgeType => b === "Шинэ" || b === "Хит" || b === "Хямдрал"
  );
  const colors = input.colors.filter((c) => c.hex);
  const primary = colors[0]?.hex ?? input.shade;

  if (idx === -1) {
    const product: Product = {
      slug: input.slug,
      name: input.name,
      brand: input.brand,
      category: input.category,
      subcategory: input.subcategory,
      price: input.price,
      oldPrice: input.oldPrice ?? undefined,
      rating: 5,
      reviews: 0,
      shade: primary,
      colors,
      images: input.images.filter(Boolean),
      stock: Math.max(0, input.stock),
      usage: input.usage,
      badges,
      badge: badges[0],
      bundle: input.bundle ?? false,
      code: input.code?.trim() || undefined,
      barcode: input.barcode?.trim() || undefined,
      short: input.short,
      description: input.description,
      ingredients: input.ingredients ?? [],
      hidden: false,
      priceHistory: [{ at: now(), from: null, to: input.price, note: "Анхны үнэ" }],
    };
    store.products.push(product);
  } else {
    const p = store.products[idx];
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
      shade: primary,
      colors,
      images: input.images.filter(Boolean),
      stock: Math.max(0, input.stock),
      usage: input.usage,
      badges,
      badge: badges[0],
      bundle: input.bundle ?? false,
      code: input.code?.trim() || undefined,
      barcode: input.barcode?.trim() || undefined,
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
    p.badges = Array.from(
      new Set<BadgeType>([...(p.badges ?? (p.badge ? [p.badge] : [])), "Хямдрал"])
    );
    p.badge = p.badges[0];
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
    p.badges = (p.badges ?? (p.badge ? [p.badge] : [])).filter(
      (b) => b !== "Хямдрал"
    );
    p.badge = p.badges[0];
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

// ============================ PROMOTIONS ============================

export type PromotionInput = Omit<Promotion, "id" | "createdAt"> & { id?: string };

export async function savePromotion(input: PromotionInput) {
  const store = await getStore();
  if (input.id) {
    const p = store.promotions.find((x) => x.id === input.id);
    if (p) Object.assign(p, input);
  } else {
    store.promotions.push({
      ...input,
      id: randomUUID(),
      createdAt: now(),
    });
  }
  await saveStore(store);
  refresh();
}

export async function togglePromotion(id: string) {
  const store = await getStore();
  const p = store.promotions.find((x) => x.id === id);
  if (p) p.active = !p.active;
  await saveStore(store);
  refresh();
}

export async function deletePromotion(id: string) {
  const store = await getStore();
  store.promotions = store.promotions.filter((p) => p.id !== id);
  await saveStore(store);
  refresh();
}

// ============================ ORDERS ============================

export async function setOrderStatus(id: string, status: OrderStatus) {
  const store = await getStore();
  const order = store.orders.find((o) => o.id === id);
  if (!order) return;

  const wasCounted = order.stockApplied === true;
  const shouldCount = status === "Баталгаажсан" || status === "Хүргэгдсэн";

  // Decrement stock when an order becomes confirmed; restore if reverted/cancelled.
  if (shouldCount && !wasCounted) {
    for (const it of order.items) {
      const p = store.products.find((x) => x.slug === it.slug);
      if (p) p.stock = Math.max(0, p.stock - it.qty);
    }
    order.stockApplied = true;
  } else if (!shouldCount && wasCounted) {
    for (const it of order.items) {
      const p = store.products.find((x) => x.slug === it.slug);
      if (p) p.stock += it.qty;
    }
    order.stockApplied = false;
  }
  order.status = status;
  await saveStore(store);
  refresh();
}

// ============================ FEEDBACK ============================

export async function toggleFeedbackHandled(id: string) {
  const store = await getStore();
  const f = store.feedback.find((x) => x.id === id);
  if (f) f.handled = !f.handled;
  await saveStore(store);
  refresh();
}

export async function deleteFeedback(id: string) {
  const store = await getStore();
  store.feedback = store.feedback.filter((f) => f.id !== id);
  await saveStore(store);
  refresh();
}

// ============================ HERO BANNER ============================

export async function saveHeroSlides(slides: HeroSlide[]) {
  const store = await getStore();
  store.heroSlides = slides
    .map((s) => ({
      id: s.id || randomUUID(),
      image: s.image ?? "",
      video: s.video || undefined,
      badge: (s.badge ?? "").trim(),
      title: (s.title ?? "").trim(),
      titleAccent: (s.titleAccent ?? "").trim(),
      subtitle: (s.subtitle ?? "").trim(),
    }))
    // Drop fully-empty slides (no media and no text).
    .filter(
      (s) => s.image || s.video || s.title || s.titleAccent || s.subtitle || s.badge
    );
  await saveStore(store);
  refresh();
}

// ============================ TRENDING ON SOCIAL ============================

export async function saveTrendingPosts(posts: TrendingPost[]) {
  const store = await getStore();
  store.trendingPosts = posts
    .map((p) => ({
      id: p.id || randomUUID(),
      url: (p.url ?? "").trim(),
      thumbnail: p.thumbnail || undefined,
      caption: (p.caption ?? "").trim() || undefined,
    }))
    // Keep a post if it has a playable link or at least a cover image.
    .filter((p) => p.url || p.thumbnail);
  await saveStore(store);
  refresh();
}

// ============================ BADGE SETTINGS ============================

export async function saveBadgeSettings(settings: BadgeSettings) {
  const store = await getStore();
  const clean = (s: { color?: string; mode?: string } | undefined, fallbackColor: string) => ({
    color: /^#[0-9a-f]{6}$/i.test(s?.color ?? "") ? (s!.color as string) : fallbackColor,
    mode: (["icon", "text", "both"].includes(s?.mode ?? "") ? s!.mode : "icon") as
      | "icon"
      | "text"
      | "both",
  });
  store.badgeSettings = {
    Хит: clean(settings.Хит, "#c56a5b"),
    Шинэ: clean(settings.Шинэ, "#059669"),
    Хямдрал: clean(settings.Хямдрал, "#c56a5b"),
  };
  await saveStore(store);
  refresh();
}

// ============================ HOMEPAGE POPUP ============================

export async function savePopupSlides(slides: PopupSlide[]) {
  const store = await getStore();
  store.popupSlides = slides
    .map((s) => ({
      id: s.id || randomUUID(),
      image: s.image ?? "",
      title: (s.title ?? "").trim(),
      subtitle: (s.subtitle ?? "").trim(),
      link: (s.link ?? "").trim(),
      linkLabel: (s.linkLabel ?? "").trim(),
    }))
    .filter((s) => s.image || s.title || s.subtitle);
  await saveStore(store);
  refresh();
}

// ============================ SUBSCRIBERS ============================

export async function deleteSubscriber(email: string) {
  const store = await getStore();
  store.subscribers = (store.subscribers ?? []).filter((s) => s.email !== email);
  await saveStore(store);
  refresh();
}
