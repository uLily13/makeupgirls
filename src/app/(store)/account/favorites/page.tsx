import Link from "next/link";
import { getCustomerUser } from "@/lib/auth";
import { getStore, withRatings } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const user = (await getCustomerUser())!;
  const store = await getStore();
  const favs = new Set(user.favorites ?? []);
  const products = withRatings(store).filter((p) => favs.has(p.slug));

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-line py-20 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-blush text-2xl text-rose">
          ♡
        </div>
        <p className="text-muted">Таны хадгалсан бүтээгдэхүүн алга байна.</p>
        <Link href="/shop" className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-white">
          Дэлгүүр үзэх
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">
        Хадгалсан бүтээгдэхүүн ({products.length})
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-6">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
