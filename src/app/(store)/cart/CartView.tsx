"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCart } from "@/lib/cart";
import { MNT, type Address, type Promotion } from "@/lib/products";
import { applyPromotions } from "@/lib/promotions";
import { placeOrder } from "@/app/(store)/account/actions";

export function CartView({
  user,
  addresses,
  promotions,
  products,
}: {
  user: { name: string } | null;
  addresses: Address[];
  promotions: Promotion[];
  products: { slug: string; name: string; price: number }[];
}) {
  const router = useRouter();
  const { items, subtotal, setQty, remove, clear } = useCart();
  const [pending, startTransition] = useTransition();
  const [checkout, setCheckout] = useState(false);
  const [addrId, setAddrId] = useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? ""
  );
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState("");

  const promo = applyPromotions(
    items.map((i) => ({ slug: i.slug, qty: i.qty, price: i.price })),
    promotions,
    products
  );
  const discount = Math.min(promo.discount, subtotal);
  const net = subtotal - discount;
  const shipping = net >= 100000 || subtotal === 0 ? 0 : 6000;
  const total = net + shipping;
  const nameOf = (slug: string) =>
    products.find((p) => p.slug === slug)?.name ?? slug;

  const submitOrder = () =>
    startTransition(async () => {
      setError("");
      const res = await placeOrder({
        items: items.map((i) => ({
          slug: i.slug,
          qty: i.qty,
          shade: i.shade,
          color: i.color,
        })),
        addressId: addrId,
      });
      if (res.ok) {
        clear();
        setCheckout(false);
        setDone(res.orderId ?? "");
        router.refresh();
      } else {
        setError(res.error ?? "Алдаа гарлаа.");
      }
    });

  // -------- Success --------
  if (done) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-5 py-28 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-green-50 text-3xl text-green-600">
          ✓
        </div>
        <h1 className="font-display text-3xl">Захиалга амжилттай!</h1>
        <p className="text-muted">
          Захиалгын дугаар <span className="font-semibold text-foreground">{done}</span>.
          Бид тантай удахгүй холбогдоно.
        </p>
        <div className="flex gap-3">
          <Link href="/account/orders" className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-white">
            Захиалгаа харах
          </Link>
          <Link href="/shop" className="rounded-full border border-line px-6 py-3 text-sm font-medium">
            Үргэлжлүүлэх
          </Link>
        </div>
      </div>
    );
  }

  // -------- Empty --------
  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-5 py-28 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-blush text-rose">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M6 8h12l-1 12H7L6 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="font-display text-3xl">Таны сагс хоосон байна</h1>
        <p className="text-muted">Онцлох бүтээгдэхүүнүүдээс сонгоод худалдан авалтаа эхлүүлээрэй.</p>
        <Link href="/shop" className="mt-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-white">
          Дэлгүүр рүү очих
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
      <h1 className="mb-8 font-display text-4xl">Сагс</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div>
          {items.map((it) => (
            <div key={it.slug} className="flex gap-4 border-b border-line py-5">
              <div
                className="h-24 w-20 shrink-0 rounded-2xl"
                style={{ background: "radial-gradient(120% 120% at 30% 20%, #fff, var(--blush))" }}
              >
                <div className="mx-auto mt-4 h-14 w-7 rounded-full" style={{ background: it.shade }} />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted">{it.brand}</span>
                <Link href={`/product/${it.slug}`} className="font-medium hover:text-rose">
                  {it.name}
                </Link>
                <span className="mt-1 text-sm text-muted">{MNT(it.price)}</span>
                <div className="mt-auto flex items-center gap-4">
                  <div className="flex items-center rounded-full border border-line">
                    <button onClick={() => setQty(it.slug, it.qty - 1)} className="grid h-8 w-8 place-items-center text-muted hover:text-foreground">−</button>
                    <span className="w-6 text-center text-sm">{it.qty}</span>
                    <button onClick={() => setQty(it.slug, it.qty + 1)} className="grid h-8 w-8 place-items-center text-muted hover:text-foreground">+</button>
                  </div>
                  <button onClick={() => remove(it.slug)} className="text-xs text-muted underline hover:text-rose-deep">Хасах</button>
                </div>
              </div>
              <div className="text-right font-semibold">{MNT(it.price * it.qty)}</div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-3xl bg-blush/50 p-6 lg:sticky lg:top-28">
          <h2 className="mb-5 font-display text-xl">Захиалгын дүн</h2>
          <div className="space-y-3 text-sm">
            <Row label="Барааны дүн" value={MNT(subtotal)} />
            <Row label="Хүргэлт" value={shipping === 0 ? "Үнэгүй" : MNT(shipping)} />
            {discount > 0 && (
              <Row label="Хөнгөлөлт" value={`-${MNT(discount)}`} rose />
            )}
            {shipping > 0 && (
              <p className="text-xs text-muted">{MNT(100000 - net)}-ийн бараа нэмбэл хүргэлт үнэгүй.</p>
            )}
          </div>
          {promo.freeItems.length > 0 && (
            <div className="mt-3 rounded-xl bg-blush/60 px-3 py-2 text-xs text-rose-deep">
              🎁 Бэлэг: {promo.freeItems.map((f) => nameOf(f.slug)).join(", ")}
            </div>
          )}
          {promo.labels.length > 0 && (
            <div className="mt-2 text-xs text-muted">
              Урамшуулал: {[...new Set(promo.labels)].join(", ")}
            </div>
          )}
          <div className="my-5 h-px bg-line" />
          <div className="flex items-center justify-between">
            <span className="font-medium">Нийт төлөх</span>
            <span className="font-display text-2xl">{MNT(total)}</span>
          </div>

          {!user ? (
            <div className="mt-6 space-y-2">
              <Link href="/login" className="btn-liquid block bg-foreground py-3.5 text-center text-sm font-medium text-white">
                Нэвтэрч захиалах
              </Link>
              <p className="text-center text-xs text-muted">
                Бүртгэлгүй юу?{" "}
                <Link href="/register" className="text-rose-deep underline">Бүртгүүлэх</Link>
              </p>
            </div>
          ) : (
            <button
              onClick={() => setCheckout(true)}
              className="btn-liquid mt-6 w-full bg-foreground py-3.5 text-sm font-medium text-white"
            >
              Худалдан авах
            </button>
          )}

          <p className="mt-3 text-center text-xs text-muted">QPay · Голомт · Хаан банк · Бэлнээр</p>
          <Link href="/shop" className="mt-4 block text-center text-xs text-muted underline">
            Үргэлжлүүлэн худалдан авах
          </Link>
        </aside>
      </div>

      {/* Checkout modal */}
      {checkout && user && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-plum/20 p-4 backdrop-blur-sm">
          <div onClick={() => setCheckout(false)} className="absolute inset-0" aria-hidden />
          <div className="glass relative my-8 w-full max-w-md rounded-3xl p-6 md:p-8">
            <h3 className="font-display text-2xl">Захиалга баталгаажуулах</h3>

            {addresses.length === 0 ? (
              <div className="mt-5 rounded-xl bg-white/60 p-4 text-sm">
                <p className="text-muted">Хүргэлтийн хаяг алга байна.</p>
                <Link href="/account/addresses" className="mt-2 inline-block font-medium text-rose-deep underline">
                  Хаяг нэмэх →
                </Link>
              </div>
            ) : (
              <>
                <p className="mt-1 text-sm text-muted">Хүргэлтийн хаягаа сонгоно уу</p>
                <div className="mt-4 space-y-2">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm ${
                        addrId === a.id ? "border-rose bg-rose/10" : "border-line bg-white/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="addr"
                        checked={addrId === a.id}
                        onChange={() => setAddrId(a.id)}
                        className="mt-1"
                      />
                      <span>
                        <span className="font-medium">{a.label} · {a.recipient}</span>
                        <br />
                        <span className="text-muted">
                          {a.city}, {a.district}, {a.khoroo}-р хороо, {a.detail} · {a.phone}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/40 pt-4">
                  <span className="text-sm text-muted">Нийт төлөх</span>
                  <span className="font-display text-xl">{MNT(total)}</span>
                </div>

                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                <div className="mt-5 flex justify-end gap-2">
                  <button onClick={() => setCheckout(false)} className="rounded-full border border-line bg-white/60 px-5 py-2.5 text-sm">
                    Болих
                  </button>
                  <button
                    onClick={submitOrder}
                    disabled={pending || !addrId}
                    className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {pending ? "Захиалж байна…" : "Захиалах"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, rose }: { label: string; value: string; rose?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={`font-medium ${rose ? "text-rose-deep" : ""}`}>{value}</span>
    </div>
  );
}
