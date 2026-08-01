import { getStore } from "@/lib/db";
import { PromotionManager } from "./PromotionManager";

export const dynamic = "force-dynamic";

export default async function AdminPromotions() {
  const store = await getStore();
  return (
    <PromotionManager
      promotions={store.promotions}
      products={store.products.map((p) => ({ slug: p.slug, name: p.name }))}
    />
  );
}
