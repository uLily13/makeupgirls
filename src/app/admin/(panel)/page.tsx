import Link from "next/link";
import { getStore } from "@/lib/db";
import { MNT } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const store = await getStore();
  const products = store.products;
  const onSale = products.filter((p) => p.oldPrice && p.oldPrice > p.price);
  const hidden = products.filter((p) => p.hidden);

  // Recent price changes across all products
  const changes = products
    .flatMap((p) =>
      (p.priceHistory ?? []).map((h) => ({ ...h, product: p.name, slug: p.slug }))
    )
    .filter((h) => h.from !== null)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  const stats = [
    { label: "Бүтээгдэхүүн", value: products.length, href: "/admin/products" },
    { label: "Урамшуулалтай", value: onSale.length, href: "/admin/reports", accent: true },
    { label: "Нуусан", value: hidden.length, href: "/admin/products" },
    { label: "Ангилал", value: store.categories.length, href: "/admin/menu" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl">Хяналтын самбар</h1>
      <p className="mt-1 text-muted">Дэлгүүрийн ерөнхий байдал</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`rounded-2xl border p-5 transition-colors hover:border-rose ${
              s.accent ? "border-rose/40 bg-rose/5" : "border-line bg-white"
            }`}
          >
            <div className="font-display text-4xl">{s.value}</div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Recent price changes */}
        <div className="rounded-2xl border border-line p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Сүүлийн үнийн өөрчлөлт</h2>
            <Link href="/admin/reports" className="text-sm text-rose-deep hover:underline">
              Тайлан →
            </Link>
          </div>
          {changes.length === 0 ? (
            <p className="text-sm text-muted">Одоогоор өөрчлөлт алга.</p>
          ) : (
            <ul className="space-y-3">
              {changes.map((h, i) => (
                <li key={i} className="flex items-center justify-between gap-4 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{h.product}</div>
                    <div className="text-xs text-muted">{h.note}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-muted line-through">{MNT(h.from!)}</span>{" "}
                    <span className={h.to < (h.from ?? 0) ? "text-rose-deep font-medium" : "font-medium"}>
                      {MNT(h.to)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-line p-6">
          <h2 className="mb-4 text-lg font-semibold">Түргэн үйлдэл</h2>
          <div className="grid gap-3">
            <QuickLink href="/admin/products" title="Бүтээгдэхүүн нэмэх / засах" desc="Үнэ, зураг, тайлбар, урамшуулал" />
            <QuickLink href="/admin/menu" title="Цэс, ангилал удирдах" desc="Ангилал, дэд ангилал нэмэх / нуух" />
            <QuickLink href="/admin/content" title="Сайтын текст засах" desc="Гарчиг, тайлбар — хуучин хувилбар хадгална" />
            <QuickLink href="/admin/reports" title="Тайлан харах" desc="Үнийн түүх, идэвхтэй урамшуулал" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl bg-blush/50 px-4 py-3 transition-colors hover:bg-blush"
    >
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted">{desc}</div>
      </div>
      <span className="text-rose-deep">→</span>
    </Link>
  );
}
