import type { Promotion } from "./products";

export type PromoLine = { slug: string; qty: number; price: number };
type PricedProduct = { slug: string; price: number };

export type PromoResult = {
  discount: number; // total ₮ discount
  freeItems: { slug: string; qty: number; from: string }[]; // gift/bogo freebies
  labels: string[]; // human-readable applied promo titles
};

// Pure promotion engine — usable on both client (cart preview) and server
// (authoritative order pricing). Only `active` promotions apply.
export function applyPromotions(
  lines: PromoLine[],
  promotions: Promotion[],
  products: PricedProduct[]
): PromoResult {
  let discount = 0;
  const freeItems: PromoResult["freeItems"] = [];
  const labels: string[] = [];
  const priceOf = (slug: string) =>
    products.find((p) => p.slug === slug)?.price ?? 0;

  for (const promo of promotions) {
    if (!promo.active) continue;
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
        const d = Math.min(promo.value, base);
        discount += d;
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
    } else if (promo.type === "gift" && promo.giftSlug) {
      // "Buy A → get B free": A = productSlugs (required), B = giftSlug.
      if (promo.productSlugs.length === 0) continue;
      const min = promo.minQty ?? 1;
      const buyers = lines.filter((l) => promo.productSlugs.includes(l.slug));
      const qtyA = buyers.reduce((n, l) => n + l.qty, 0);
      if (qtyA >= min) {
        // one B per qualifying set of A
        const sets = Math.floor(qtyA / min);
        freeItems.push({ slug: promo.giftSlug, qty: sets, from: promo.title });
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
    (pr) => pr.active && (pr.productSlugs.length === 0 || pr.productSlugs.includes(slug))
  );
  if (!p) return null;
  if (p.type === "percent") return `-${p.value}%`;
  if (p.type === "amount") return "Хямдрал";
  if (p.type === "bogo") return `${p.buyQty ?? 1}+${p.freeQty ?? 1}`;
  if (p.type === "gift") return "Бэлэгтэй";
  return null;
}
