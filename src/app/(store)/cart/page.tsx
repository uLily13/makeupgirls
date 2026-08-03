import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { CartView } from "./CartView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Сагс — makeupgirls" };

export default async function CartPage() {
  const user = await getCurrentUser();
  const store = await getStore();
  return (
    <Suspense>
      <CartView
        user={user ? { name: user.name } : null}
        addresses={user?.addresses ?? []}
        promotions={store.promotions.filter((p) => p.active)}
        products={store.products.map((p) => ({
          slug: p.slug,
          name: p.name,
          price: p.price,
        }))}
      />
    </Suspense>
  );
}
