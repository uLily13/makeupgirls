import { Suspense } from "react";
import { ShopClient } from "./ShopClient";
import { getStore, visibleCategories, visibleSubcategories, withRatings } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Дэлгүүр — makeupgirls",
};

export default async function ShopPage() {
  const store = await getStore();
  const categories = visibleCategories(store);
  const subcategories = visibleSubcategories(store);
  const products = withRatings(store);

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-5 py-20 text-center text-muted lg:px-8">
          Ачааллаж байна…
        </div>
      }
    >
      <ShopClient
        categories={categories}
        subcategories={subcategories}
        products={products}
      />
    </Suspense>
  );
}
