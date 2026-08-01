import { getStore } from "@/lib/db";
import { MenuManager } from "./MenuManager";

export const dynamic = "force-dynamic";

export default async function AdminMenu() {
  const store = await getStore();
  const counts: Record<string, number> = {};
  for (const p of store.products)
    counts[p.subcategory] = (counts[p.subcategory] ?? 0) + 1;

  return (
    <MenuManager
      categories={store.categories}
      subcategories={store.subcategories}
      counts={counts}
    />
  );
}
