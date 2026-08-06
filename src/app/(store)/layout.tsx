import { CartProvider } from "@/lib/cart";
import { FavoritesProvider } from "@/lib/favorites";
import { QuickViewProvider } from "@/lib/quickview";
import { BadgeSettingsProvider } from "@/lib/badgeSettings";
import { defaultBadgeSettings } from "@/lib/products";
import { Header, type MenuCategory } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { QuickView } from "@/components/QuickView";
import { LiquidBackground } from "@/components/LiquidBackground";
import {
  getStore,
  resolveContent,
  visibleCategories,
  visibleSubcategories,
  visibleProducts,
  countProductsInSub,
} from "@/lib/db";
import { getCustomerUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await getStore();
  const content = resolveContent(store);
  const user = await getCustomerUser();

  const menu: MenuCategory[] = visibleCategories(store).map((c) => ({
    slug: c.slug,
    name: c.name,
    tagline: c.tagline,
    subs: visibleSubcategories(store, c.slug).map((s) => ({
      slug: s.slug,
      name: s.name,
      count: countProductsInSub(store, s.slug),
    })),
  }));

  const announcements = [
    content["announce.1"],
    content["announce.2"],
    content["announce.3"],
    content["announce.4"],
  ].filter(Boolean);

  const searchItems = visibleProducts(store).map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    price: p.price,
    image: p.images?.[0] ?? p.colors?.find((c) => c.image)?.image,
    shade: p.shade,
  }));

  return (
    <>
      <LiquidBackground />
      <FavoritesProvider initial={user?.favorites ?? []} loggedIn={!!user}>
        <CartProvider>
          <QuickViewProvider>
          <BadgeSettingsProvider value={store.badgeSettings ?? defaultBadgeSettings}>
            <Header
              menu={menu}
              announcements={announcements}
              user={user ? { name: user.name } : null}
              favCount={user?.favorites?.length ?? 0}
              searchItems={searchItems}
            />
            <main className="flex-1">{children}</main>
            <Footer content={content} />
            <CartDrawer />
            <QuickView />
          </BadgeSettingsProvider>
          </QuickViewProvider>
        </CartProvider>
      </FavoritesProvider>
    </>
  );
}
