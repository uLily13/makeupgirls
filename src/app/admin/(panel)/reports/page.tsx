import { getStore } from "@/lib/db";
import { MNT } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminReports() {
  const store = await getStore();

  const promos = store.products
    .filter((p) => p.oldPrice && p.oldPrice > p.price)
    .map((p) => ({
      name: p.name,
      brand: p.brand,
      from: p.oldPrice!,
      to: p.price,
      pct: Math.round((1 - p.price / p.oldPrice!) * 100),
      save: p.oldPrice! - p.price,
    }));

  const log = store.products
    .flatMap((p) =>
      (p.priceHistory ?? []).map((h) => ({ ...h, product: p.name }))
    )
    .filter((h) => h.from !== null)
    .sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div>
      <h1 className="font-display text-3xl">Тайлан</h1>
      <p className="mt-1 text-muted">Үнийн түүх ба идэвхтэй урамшуулал</p>

      {/* Active promotions */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-rose-deep">
          Идэвхтэй урамшуулал ({promos.length})
        </h2>
        {promos.length === 0 ? (
          <div className="rounded-2xl border border-line p-6 text-sm text-muted">
            Одоогоор идэвхтэй урамшуулал алга.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="border-b border-line bg-blush/40 text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Бүтээгдэхүүн</th>
                  <th className="px-4 py-3 font-semibold">Хуучин</th>
                  <th className="px-4 py-3 font-semibold">Шинэ</th>
                  <th className="px-4 py-3 font-semibold">Хямдрал</th>
                  <th className="px-4 py-3 font-semibold">Хэмнэлт</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted">{p.brand}</div>
                    </td>
                    <td className="px-4 py-3 text-muted line-through">{MNT(p.from)}</td>
                    <td className="px-4 py-3 font-medium text-rose-deep">{MNT(p.to)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-rose/15 px-2 py-0.5 text-xs font-medium text-rose-deep">
                        -{p.pct}%
                      </span>
                    </td>
                    <td className="px-4 py-3">{MNT(p.save)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Price history */}
      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-rose-deep">
          Үнийн өөрчлөлтийн түүх ({log.length})
        </h2>
        {log.length === 0 ? (
          <div className="rounded-2xl border border-line p-6 text-sm text-muted">
            Үнэ өөрчлөгдсөн түүх алга.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="border-b border-line bg-blush/40 text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Огноо</th>
                  <th className="px-4 py-3 font-semibold">Бүтээгдэхүүн</th>
                  <th className="px-4 py-3 font-semibold">Өмнөх</th>
                  <th className="px-4 py-3 font-semibold">Шинэ</th>
                  <th className="px-4 py-3 font-semibold">Тэмдэглэл</th>
                </tr>
              </thead>
              <tbody>
                {log.map((h, i) => {
                  const down = h.to < (h.from ?? 0);
                  return (
                    <tr key={i} className="border-b border-line last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 text-muted">
                        {new Date(h.at).toLocaleDateString("mn-MN")}
                      </td>
                      <td className="px-4 py-3 font-medium">{h.product}</td>
                      <td className="px-4 py-3 text-muted line-through">
                        {MNT(h.from!)}
                      </td>
                      <td className={`px-4 py-3 font-medium ${down ? "text-rose-deep" : "text-green-600"}`}>
                        {down ? "↓" : "↑"} {MNT(h.to)}
                      </td>
                      <td className="px-4 py-3 text-muted">{h.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
