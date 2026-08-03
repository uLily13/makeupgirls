import Link from "next/link";
import { getCustomerUser } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { MNT } from "@/lib/products";

export const dynamic = "force-dynamic";

const statusColor: Record<string, string> = {
  "Хүлээгдэж буй": "bg-amber-50 text-amber-600",
  "Хүргэгдсэн": "bg-green-50 text-green-600",
  "Цуцлагдсан": "bg-gray-100 text-gray-400",
};

export default async function OrdersPage() {
  const user = (await getCustomerUser())!;
  const store = await getStore();
  const orders = store.orders
    .filter((o) => o.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-line py-20 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-blush text-rose">📦</div>
        <p className="text-muted">Танд захиалгын түүх алга байна.</p>
        <Link href="/shop" className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-white">
          Худалдан авалт эхлүүлэх
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Захиалгын түүх</h2>
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border border-line p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <div>
              <span className="font-medium">{o.id}</span>
              <span className="ml-3 text-sm text-muted">
                {new Date(o.createdAt).toLocaleDateString("mn-MN")}
              </span>
            </div>
            <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${statusColor[o.status]}`}>
              {o.status}
            </span>
          </div>

          <div className="divide-y divide-line py-2">
            {o.items.map((it) => (
              <div key={it.slug} className="flex items-center gap-3 py-2.5">
                <span className="h-9 w-7 shrink-0 rounded-md" style={{ background: it.shade }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{it.name}</div>
                  <div className="text-xs text-muted">
                    {it.brand} · {it.qty} ш
                  </div>
                </div>
                <div className="text-sm">{MNT(it.price * it.qty)}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-line pt-3 text-sm">
            <span className="text-muted">
              {o.address ? `${o.address.city}, ${o.address.district}` : "Хаяг байхгүй"}
            </span>
            <span className="font-medium">
              Нийт: <span className="font-display text-base">{MNT(o.total)}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
