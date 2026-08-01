import Link from "next/link";
import { notFound } from "next/navigation";
import { MNT } from "@/lib/products";
import { getStore, visibleProducts, withRatings } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ProductCard } from "@/components/ProductCard";
import { FavoriteButton } from "@/components/FavoriteButton";
import { TrackRecentlyViewed } from "@/components/RecentlyViewed";
import { AddToCart } from "./AddToCart";
import { ProductGallery } from "./ProductGallery";
import { ReviewSection } from "./ReviewSection";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStore();
  const product = store.products.find((p) => p.slug === slug);
  return { title: product ? `${product.name} — makeupgirls` : "makeupgirls" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStore();
  const rated = withRatings(store);
  const product = rated.find((p) => p.slug === slug);
  if (!product) notFound();

  const user = await getCurrentUser();
  const category = store.categories.find((c) => c.slug === product.category);
  const reviews = store.reviews.filter((r) => r.productSlug === product.slug);
  const related = rated
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <TrackRecentlyViewed
        product={{
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          price: product.price,
          shade: product.shade,
          image: product.images?.[0],
        }}
      />

      {/* Breadcrumb */}
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-rose">Нүүр</Link>
        <span>/</span>
        <Link href={`/shop?cat=${product.category}`} className="hover:text-rose">
          {category?.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <ProductGallery
          images={product.images ?? []}
          shade={product.shade}
          colors={product.colors ?? []}
        />

        {/* Info */}
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
            {product.brand}
          </span>
          <h1 className="mt-2 font-display text-3xl leading-tight md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3 text-sm">
            {product.reviews > 0 ? (
              <>
                <span className="text-gold">
                  {"★★★★★".slice(0, Math.round(product.rating))}
                  <span className="text-line">
                    {"★★★★★".slice(Math.round(product.rating))}
                  </span>
                </span>
                <span className="text-muted">
                  {product.rating.toFixed(1)} · {product.reviews} сэтгэгдэл
                </span>
              </>
            ) : (
              <span className="text-muted">Сэтгэгдэлгүй</span>
            )}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="font-display text-3xl">{MNT(product.price)}</span>
            {product.oldPrice && (
              <>
                <span className="text-lg text-muted line-through">
                  {MNT(product.oldPrice)}
                </span>
                <span className="rounded-full bg-gold px-2.5 py-1 text-xs font-semibold text-white">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-foreground/75">
            {product.description}
          </p>

          <div className="my-8 h-px bg-line" />

          <AddToCart product={product} />

          <div className="mt-5">
            <FavoriteButton slug={product.slug} />
          </div>

          {/* Ingredients */}
          {product.ingredients.length > 0 && (
            <div className="mt-10">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
                Гол найрлага
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="rounded-full bg-blush px-4 py-2 text-sm text-rose-deep"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Usage instructions */}
          {product.usage && (
            <details className="group mt-6 rounded-2xl border border-line p-5">
              <summary className="flex cursor-pointer items-center justify-between font-medium">
                Хэрэглэх заавар
                <span className="text-muted transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                {product.usage}
              </p>
            </details>
          )}

          {/* Assurance */}
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            {[
              ["🚚", "Хурдан хүргэлт", "УБ хотод 24 цагт"],
              ["✓", "100% жинхэнэ", "Албан ёсны эх сурвалж"],
            ].map(([i, t, d]) => (
              <div key={t} className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-blush">
                  {i}
                </span>
                <div>
                  <div className="font-medium">{t}</div>
                  <div className="text-xs text-muted">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <ReviewSection slug={product.slug} reviews={reviews} loggedIn={!!user} />

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-8 font-display text-2xl">Танд бас таалагдаж магадгүй</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
