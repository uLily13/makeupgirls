"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MNT, type Order, type OrderStatus } from "@/lib/products";
import { PaymentTag } from "@/components/PaymentMethods";
import { setOrderStatus } from "../actions";

type Row = Order & { customer: string; customerPhone: string };

const STATUSES: OrderStatus[] = ["Хүлээгдэж буй", "Баталгаажсан", "Хүргэгдсэн", "Цуцлагдсан"];
const statusColor: Record<OrderStatus, string> = {
  "Хүлээгдэж буй": "bg-amber-50 text-amber-600",
  "Баталгаажсан": "bg-blue-50 text-blue-600",
  "Хүргэгдсэн": "bg-green-50 text-green-600",
  "Цуцлагдсан": "bg-gray-100 text-gray-400",
};
// The next natural status in the fulfilment flow (for the one-click advance).
const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  "Хүлээгдэж буй": "Баталгаажсан",
  "Баталгаажсан": "Хүргэгдсэн",
};

export function OrderManager({ orders }: { orders: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const s of STATUSES) c[s] = 0;
    for (const o of orders) c[o.status]++;
    return c;
  }, [orders]);

  const revenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === "Хүргэгдсэн")
        .reduce((n, o) => n + o.total, 0),
    [orders]
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (q) {
        const hay = `${o.id} ${o.customer} ${o.customerPhone}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, filter, query]);

  const setStatus = (id: string, s: OrderStatus) =>
    startTransition(async () => {
      await setOrderStatus(id, s);
      router.refresh();
    });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl">Захиалга</h1>
        <p className="mt-1 text-muted">Захиалгын урсгал, төлөв, төлбөр</p>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Нийт захиалга" value={String(counts.all)} />
        <Stat label="Хүлээгдэж буй" value={String(counts["Хүлээгдэж буй"])} accent="text-amber-600" />
        <Stat label="Хүргэгдсэн" value={String(counts["Хүргэгдсэн"])} accent="text-green-600" />
        <Stat label="Орлого (хүргэгдсэн)" value={MNT(revenue)} />
      </div>

      {/* Search + filter */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-xs flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Дугаар, нэр, утсаар хайх…"
            className="w-full rounded-xl border border-line py-2.5 pl-9 pr-3.5 text-sm focus:border-rose focus:outline-none"
          />
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            Бүгд {counts.all}
          </FilterChip>
          {STATUSES.map((s) => (
            <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
              {s} {counts[s]}
            </FilterChip>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-line py-16 text-center text-muted">
          {orders.length === 0 ? "Захиалга алга." : "Тохирох захиалга олдсонгүй."}
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((o) => {
            const isOpen = open === o.id;
            const adv = nextStatus[o.status];
            const itemCount = o.items.reduce((n, i) => n + i.qty, 0);
            return (
              <div key={o.id} className="rounded-2xl border border-line bg-white">
                <button
                  onClick={() => setOpen(isOpen ? null : o.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{o.id}</span>
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${statusColor[o.status]}`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-muted">
                      {o.customer} · {o.customerPhone || "утасгүй"} · {itemCount} бараа ·{" "}
                      {new Date(o.createdAt).toLocaleString("mn-MN")}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <PaymentTag id={o.paymentMethod} />
                    <span className="font-display text-lg">{MNT(o.total)}</span>
                    <span className="text-muted">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-line p-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase text-muted">Бараа</div>
                        {o.items.map((it, i) => (
                          <div key={i} className="flex justify-between py-1 text-sm">
                            <span>
                              {it.name}
                              {it.color ? ` · ${it.color}` : ""} × {it.qty}
                              {it.free && <span className="ml-1 text-rose-deep">(бэлэг)</span>}
                            </span>
                            <span>{it.free ? "0₮" : MNT(it.price * it.qty)}</span>
                          </div>
                        ))}
                        <div className="mt-2 space-y-1 border-t border-line pt-2 text-sm">
                          {o.discount > 0 && (
                            <div className="flex justify-between text-rose-deep">
                              <span>Хөнгөлөлт</span><span>-{MNT(o.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted">Хүргэлт</span>
                            <span>{o.shipping === 0 ? "Үнэгүй" : MNT(o.shipping)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Төлбөрийн хэлбэр</span>
                            <PaymentTag id={o.paymentMethod} />
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Нийт</span><span>{MNT(o.total)}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase text-muted">Хүргэлт</div>
                        {o.address ? (
                          <p className="text-sm text-foreground/80">
                            {o.address.recipient} · {o.address.phone}
                            <br />
                            {o.address.city}, {o.address.district}, {o.address.khoroo}-р хороо
                            <br />
                            {o.address.detail}
                          </p>
                        ) : (
                          <p className="text-sm text-muted">Хаяг байхгүй</p>
                        )}

                        {adv && (
                          <button
                            onClick={() => setStatus(o.id, adv)}
                            disabled={pending}
                            className="mt-4 w-full rounded-xl bg-foreground py-2.5 text-sm font-medium text-white hover:bg-rose-deep disabled:opacity-50"
                          >
                            → {adv} болгох
                          </button>
                        )}

                        <div className="mt-4 text-xs font-semibold uppercase text-muted">Төлөв солих</div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() => setStatus(o.id, s)}
                              disabled={pending || o.status === s}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-40 ${
                                o.status === s ? "border-foreground bg-foreground text-white" : "border-line hover:border-rose"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent = "" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 font-display text-2xl ${accent}`}>{value}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active ? "bg-foreground text-white" : "border border-line text-foreground/70 hover:border-rose"
      }`}
    >
      {children}
    </button>
  );
}
