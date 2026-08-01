import { getStore } from "@/lib/db";
import { ProductManager } from "./ProductManager";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const store = await getStore();
  return (
    <ProductManager
      products={store.products}
      categories={store.categories}
      subcategories={store.subcategories}
    />
  );
}
