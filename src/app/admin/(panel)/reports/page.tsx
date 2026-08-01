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

  // Sales metrics from confirmed/delivered orders
  const fulfilled = store.orders.filter(
    (o) => o.status === "Баталгаажсан" || o.status === "Хүргэгдсэн"
  );
  const revenue = fulfilled.reduce((n, o) => n + o.total, 0);
  const avg = fulfilled.length ? Math.round(revenue / fulfilled.length) : 0;
  const sold: Record<string, { name: string; qty: number }> = {};
  for (const o of fulfilled)
    for (const it of o.items) {
      if (it.free) continue;
      const s = (sold[it.slug] ??= { name: it.name, qty: 0 });
      s.qty += it.qty;
    }
  const top = Object.values(sold).sort((a, b) => b.qty - a.qty).slice(0, 5);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Тайлан</h1>
          <p className="mt-1 text-muted">Борлуулалт, үнийн түүх, урамшуулал</p>
        </div>
        <a
          href="/admin/reports/export"
          className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
        >
          ⬇ Excel татах
        </a>
      </div>

      {/* Sales metrics */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="Нийт орлого" value={MNT(revenue)} />
        <Metric label="Биелсэн захиалга" value={String(fulfilled.length)} />
        <Metric label="Дундаж захиалга" value={MNT(avg)} />
        <Metric label="Нийт захиалга" value={String(store.orders.length)} />
      </div>

      {top.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-rose-deep">
            Хамгийн их зарагдсан
          </h2>
          <div className="overflow-hidden rounded-2xl border border-line">
            {top.map((t, i) => (
              <div key={i} className="flex items-center justify-between border-b border-line px-4 py-3 text-sm last:border-0">
                <span className="font-medium">{i + 1}. {t.name}</span>
                <span className="text-muted">{t.qty} ширхэг</span>
              </div>
            ))}
          </div>
        </section>
      )}

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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line p-5">
      <div className="font-display text-2xl">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}
