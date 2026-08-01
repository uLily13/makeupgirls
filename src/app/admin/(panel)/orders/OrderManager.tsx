"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MNT, type Order, type OrderStatus } from "@/lib/products";
import { setOrderStatus } from "../actions";

type Row = Order & { customer: string; customerPhone: string };

const STATUSES: OrderStatus[] = ["Хүлээгдэж буй", "Баталгаажсан", "Хүргэгдсэн", "Цуцлагдсан"];
const statusColor: Record<OrderStatus, string> = {
  "Хүлээгдэж буй": "bg-amber-50 text-amber-600",
  "Баталгаажсан": "bg-blue-50 text-blue-600",
  "Хүргэгдсэн": "bg-green-50 text-green-600",
  "Цуцлагдсан": "bg-gray-100 text-gray-400",
};

export function OrderManager({ orders }: { orders: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"active" | "done" | "all">("active");
  const [open, setOpen] = useState<string | null>(null);

  const shown = orders.filter((o) =>
    filter === "all"
      ? true
      : filter === "active"
        ? o.status === "Хүлээгдэж буй" || o.status === "Баталгаажсан"
        : o.status === "Хүргэгдсэн" || o.status === "Цуцлагдсан"
  );

  const setStatus = (id: string, s: OrderStatus) =>
    startTransition(async () => {
      await setOrderStatus(id, s);
      router.refresh();
    });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl">Захиалга</h1>
        <p className="mt-1 text-muted">{orders.length} захиалга</p>
      </div>

      <div className="mb-5 flex gap-2">
        {[
          { k: "active", label: "Идэвхтэй" },
          { k: "done", label: "Дууссан" },
          { k: "all", label: "Бүгд" },
        ].map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k as typeof filter)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              filter === f.k ? "bg-foreground text-white" : "border border-line text-foreground/70"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-line py-16 text-center text-muted">
          Захиалга алга.
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((o) => (
            <div key={o.id} className="rounded-2xl border border-line p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{o.id}</span>
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${statusColor[o.status]}`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {o.customer} · {o.customerPhone} ·{" "}
                    {new Date(o.createdAt).toLocaleString("mn-MN")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg">{MNT(o.total)}</span>
                  <button
                    onClick={() => setOpen(open === o.id ? null : o.id)}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium"
                  >
                    {open === o.id ? "Хаах" : "Дэлгэрэнгүй"}
                  </button>
                </div>
              </div>

              {open === o.id && (
                <div className="mt-4 border-t border-line pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
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
          ))}
        </div>
      )}
    </div>
  );
}
