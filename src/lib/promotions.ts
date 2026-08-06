import type { GiftItem, Promotion } from "./products";

export type PromoLine = { slug: string; qty: number; price: number };
type PricedProduct = { slug: string; price: number };

export type PromoResult = {
  discount: number; // total ₮ discount
  freeItems: { slug: string; qty: number; from: string }[]; // gift/bogo freebies
  labels: string[]; // human-readable applied promo titles
};

// Normalise a promotion's gift list (supports the legacy single `giftSlug`).
export function promoGifts(p: Promotion): GiftItem[] {
  if (p.gifts && p.gifts.length) return p.gifts.filter((g) => g.slug);
  if (p.giftSlug) return [{ slug: p.giftSlug, qty: 1 }];
  return [];
}

// Whether a promotion is live right now: active and inside its date window.
export function isPromoLive(p: Promotion, now: Date = new Date()): boolean {
  if (!p.active) return false;
  const today = now.toISOString().slice(0, 10); // YYYY-MM-DD (date-only compare)
  if (p.startsAt && today < p.startsAt) return false;
  if (p.endsAt && today > p.endsAt) return false;
  return true;
}

// Pure promotion engine — usable on both client (cart preview) and server
// (authoritative order pricing). Only live (active + in-window) promotions apply.
export function applyPromotions(
  lines: PromoLine[],
  promotions: Promotion[],
  products: PricedProduct[],
  now: Date = new Date()
): PromoResult {
  let discount = 0;
  const freeItems: PromoResult["freeItems"] = [];
  const labels: string[] = [];
  const priceOf = (slug: string) =>
    products.find((p) => p.slug === slug)?.price ?? 0;
  const cartTotal = lines.reduce((n, l) => n + l.price * l.qty, 0);

  for (const promo of promotions) {
    if (!isPromoLive(promo, now)) continue;
    const scope = new Set(promo.productSlugs);
    const inScope = lines.filter((l) => scope.size === 0 || scope.has(l.slug));

    if (promo.type === "percent" && promo.value) {
      const base = inScope.reduce((n, l) => n + l.price * l.qty, 0);
      const d = Math.round((base * promo.value) / 100);
      if (d > 0) {
        discount += d;
        labels.push(promo.title);
      }
    } else if (promo.type === "amount" && promo.value) {
      const base = inScope.reduce((n, l) => n + l.price * l.qty, 0);
      if (base > 0) {
        discount += Math.min(promo.value, base);
        labels.push(promo.title);
      }
    } else if (promo.type === "spend_amount" && promo.value) {
      // Cart total ≥ threshold → fixed ₮ off.
      const threshold = promo.threshold ?? 0;
      if (cartTotal >= threshold && cartTotal > 0) {
        discount += Math.min(promo.value, cartTotal);
        labels.push(promo.title);
      }
    } else if (promo.type === "bogo") {
      const buy = promo.buyQty ?? 1;
      const free = promo.freeQty ?? 1;
      const group = buy + free;
      let applied = false;
      for (const l of inScope) {
        const sets = Math.floor(l.qty / group);
        if (sets > 0) {
          discount += sets * free * l.price;
          applied = true;
        }
      }
      if (applied) labels.push(promo.title);
    } else if (promo.type === "nth_discount" && promo.value) {
      // Buy `buyQty` → the next (buyQty+1)-th item is `value`% off.
      const buy = promo.buyQty ?? 2;
      const group = buy + 1;
      let applied = false;
      for (const l of inScope) {
        const sets = Math.floor(l.qty / group);
        if (sets > 0) {
          discount += Math.round((sets * l.price * promo.value) / 100);
          applied = true;
        }
      }
      if (applied) labels.push(promo.title);
    } else if (promo.type === "gift") {
      // Buy A (scope, minQty) → gift B, C… free.
      if (promo.productSlugs.length === 0) continue;
      const gifts = promoGifts(promo);
      if (gifts.length === 0) continue;
      const min = promo.minQty ?? 1;
      const qtyA = lines
        .filter((l) => promo.productSlugs.includes(l.slug))
        .reduce((n, l) => n + l.qty, 0);
      if (qtyA >= min) {
        const sets = Math.floor(qtyA / min);
        for (const g of gifts)
          freeItems.push({ slug: g.slug, qty: sets * (g.qty || 1), from: promo.title });
        labels.push(promo.title);
      }
    } else if (promo.type === "spend_gift") {
      // Cart total ≥ threshold → gift B, C… free.
      const gifts = promoGifts(promo);
      const threshold = promo.threshold ?? 0;
      if (gifts.length && cartTotal >= threshold && cartTotal > 0) {
        for (const g of gifts)
          freeItems.push({ slug: g.slug, qty: g.qty || 1, from: promo.title });
        labels.push(promo.title);
      }
    }
  }

  // Freebies also reduce the payable amount by their price.
  for (const f of freeItems) discount += priceOf(f.slug) * f.qty;

  return { discount, freeItems, labels };
}

export function promoBadgeFor(
  slug: string,
  promotions: Promotion[]
): string | null {
  const p = promotions.find(
    (pr) =>
      isPromoLive(pr) &&
      (pr.productSlugs.length === 0 || pr.productSlugs.includes(slug))
  );
  if (!p) return null;
  if (p.type === "percent") return `-${p.value}%`;
  if (p.type === "amount" || p.type === "spend_amount") return "Хямдрал";
  if (p.type === "bogo") return `${p.buyQty ?? 1}+${p.freeQty ?? 1}`;
  if (p.type === "nth_discount") return `-${p.value}%`;
  if (p.type === "gift" || p.type === "spend_gift") return "Бэлэгтэй";
  return null;
}
