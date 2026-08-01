import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { MNT } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AccountHome() {
  const user = (await getCurrentUser())!;
  const store = await getStore();
  const orders = store.orders
    .filter((o) => o.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const last = orders[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Захиалга" value={orders.length} href="/account/orders" />
        <Stat label="Хадгалсан хаяг" value={user.addresses.length} href="/account/addresses" />
      </div>

      <div className="rounded-2xl border border-line p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Сүүлийн захиалга</h2>
          <Link href="/account/orders" className="text-sm text-rose-deep hover:underline">
            Бүгд →
          </Link>
        </div>
        {last ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{last.id}</div>
              <div className="text-sm text-muted">
                {last.items.length} бүтээгдэхүүн · {last.status}
              </div>
            </div>
            <div className="font-display text-xl">{MNT(last.total)}</div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted">Та одоогоор захиалга хийгээгүй байна.</p>
            <Link
              href="/shop"
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-white"
            >
              Дэлгүүр рүү
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-line p-5 transition-colors hover:border-rose"
    >
      <div className="font-display text-4xl">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </Link>
  );
}
