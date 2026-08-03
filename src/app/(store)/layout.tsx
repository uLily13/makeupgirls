import { CartProvider } from "@/lib/cart";
import { FavoritesProvider } from "@/lib/favorites";
import { Header, type MenuCategory } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { LiquidBackground } from "@/components/LiquidBackground";
import {
  getStore,
  resolveContent,
  visibleCategories,
  visibleSubcategories,
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

  return (
    <>
      <LiquidBackground />
      <FavoritesProvider initial={user?.favorites ?? []} loggedIn={!!user}>
        <CartProvider>
          <Header
            menu={menu}
            announcements={announcements}
            user={user ? { name: user.name } : null}
            favCount={user?.favorites?.length ?? 0}
          />
          <main className="flex-1">{children}</main>
          <Footer
            categories={menu.map((m) => ({ slug: m.slug, name: m.name }))}
            content={content}
          />
          <CartDrawer />
        </CartProvider>
      </FavoritesProvider>
    </>
  );
}
