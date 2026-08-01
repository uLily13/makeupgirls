"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Promotion, PromotionType } from "@/lib/products";
import { savePromotion, togglePromotion, deletePromotion, type PromotionInput } from "../actions";

const TYPES: { value: PromotionType; label: string; hint: string }[] = [
  { value: "percent", label: "Хувийн хөнгөлөлт", hint: "Сонгосон бүтээгдэхүүнд %-ийн хөнгөлөлт" },
  { value: "amount", label: "Мөнгөн хөнгөлөлт", hint: "Тодорхой ₮ хасна" },
  { value: "bogo", label: "1+1 (авбал үнэгүй)", hint: "N авбал M үнэгүй" },
  { value: "gift", label: "Бэлэг дагалдуулах", hint: "A авбал B үнэгүй дагалдана" },
];

type Form = PromotionInput;
const empty = (): Form => ({
  title: "",
  type: "percent",
  active: true,
  productSlugs: [],
  value: 10,
  buyQty: 1,
  freeQty: 1,
  giftSlug: "",
  minQty: 1,
});

export function PromotionManager({
  promotions,
  products,
}: {
  promotions: Promotion[];
  products: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<Form | null>(null);

  const run = (fn: () => Promise<void>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  const nameOf = (slug: string) => products.find((p) => p.slug === slug)?.name ?? slug;
  const typeLabel = (t: PromotionType) => TYPES.find((x) => x.value === t)?.label ?? t;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Урамшуулал</h1>
          <p className="mt-1 text-muted">Хөнгөлөлт, 1+1, бэлэг зэргийг удирдах</p>
        </div>
        <button
          onClick={() => setForm(empty())}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-deep"
        >
          + Урамшуулал
        </button>
      </div>

      {promotions.length === 0 ? (
        <div className="rounded-2xl border border-line py-16 text-center text-muted">
          Идэвхтэй урамшуулал алга. Шинээр нэмээрэй.
        </div>
      ) : (
        <div className="space-y-3">
          {promotions.map((p) => (
            <div
              key={p.id}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-5 ${
                p.active ? "border-line" : "border-line bg-gray-50 opacity-70"
              }`}
            >
              <div>
                <div className="flex items-center gap-2 font-semibold">
                  {p.title}
                  <span className="rounded-md bg-blush px-2 py-0.5 text-[11px] text-rose-deep">
                    {typeLabel(p.type)}
                  </span>
                  {p.active ? (
                    <span className="rounded-md bg-green-50 px-2 py-0.5 text-[11px] text-green-600">идэвхтэй</span>
                  ) : (
                    <span className="rounded-md bg-gray-200 px-2 py-0.5 text-[11px] text-gray-500">идэвхгүй</span>
                  )}
                </div>
                <div className="mt-1 text-sm text-muted">
                  {p.type === "percent" && `${p.value}% хөнгөлөлт`}
                  {p.type === "amount" && `${p.value}₮ хасна`}
                  {p.type === "bogo" && `${p.buyQty} авбал ${p.freeQty} үнэгүй`}
                  {p.type === "gift" && `${p.minQty}ш авбал "${nameOf(p.giftSlug ?? "")}" бэлэг`}
                  {p.productSlugs.length > 0
                    ? ` · ${p.productSlugs.length} бүтээгдэхүүн`
                    : " · бүх бүтээгдэхүүн"}
                </div>
              </div>
              <div className="flex gap-1.5">
                <Btn onClick={() => setForm({ ...p })}>Засах</Btn>
                <Btn onClick={() => run(() => togglePromotion(p.id))} disabled={pending}>
                  {p.active ? "Зогсоох" : "Идэвхжүүлэх"}
                </Btn>
                <Btn danger onClick={() => { if (confirm("Устгах уу?")) run(() => deletePromotion(p.id)); }} disabled={pending}>
                  Устгах
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 p-4 backdrop-blur-sm">
          <div onClick={() => setForm(null)} className="absolute inset-0" aria-hidden />
          <div className="relative my-8 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl md:p-8">
            <h3 className="font-display text-xl">{form.id ? "Урамшуулал засах" : "Шинэ урамшуулал"}</h3>
            <div className="mt-4 space-y-4">
              <L label="Гарчиг">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Жишээ: Зуны хямдрал" />
              </L>
              <L label="Төрөл">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PromotionType })} className={inputCls}>
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <span className="mt-1 text-xs text-muted">{TYPES.find((t) => t.value === form.type)?.hint}</span>
              </L>

              {(form.type === "percent" || form.type === "amount") && (
                <L label={form.type === "percent" ? "Хувь (%)" : "Дүн (₮)"}>
                  <input type="number" value={form.value ?? 0} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className={inputCls} />
                </L>
              )}
              {form.type === "bogo" && (
                <div className="grid grid-cols-2 gap-3">
                  <L label="Авах тоо (N)">
                    <input type="number" value={form.buyQty ?? 1} onChange={(e) => setForm({ ...form, buyQty: Number(e.target.value) })} className={inputCls} />
                  </L>
                  <L label="Үнэгүй тоо (M)">
                    <input type="number" value={form.freeQty ?? 1} onChange={(e) => setForm({ ...form, freeQty: Number(e.target.value) })} className={inputCls} />
                  </L>
                </div>
              )}
              {form.type === "gift" && (
                <div className="grid grid-cols-2 gap-3">
                  <L label="Доод тоо">
                    <input type="number" value={form.minQty ?? 1} onChange={(e) => setForm({ ...form, minQty: Number(e.target.value) })} className={inputCls} />
                  </L>
                  <L label="Бэлэг бүтээгдэхүүн">
                    <select value={form.giftSlug ?? ""} onChange={(e) => setForm({ ...form, giftSlug: e.target.value })} className={inputCls}>
                      <option value="">— сонгох —</option>
                      {products.map((p) => (<option key={p.slug} value={p.slug}>{p.name}</option>))}
                    </select>
                  </L>
                </div>
              )}

              <L label="Хамрах бүтээгдэхүүн (хоосон = бүгд)">
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-line p-3">
                  {products.map((p) => (
                    <label key={p.slug} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.productSlugs.includes(p.slug)}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            productSlugs: e.target.checked
                              ? [...form.productSlugs, p.slug]
                              : form.productSlugs.filter((s) => s !== p.slug),
                          })
                        }
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </L>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Идэвхтэй
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setForm(null)} className="rounded-full border border-line px-5 py-2.5 text-sm">Болих</button>
              <button
                disabled={pending || !form.title}
                onClick={() => run(async () => { await savePromotion(form); setForm(null); })}
                className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-rose focus:outline-none";
function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
function Btn({ children, onClick, danger, disabled }: { children: React.ReactNode; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-40 ${danger ? "border-red-200 text-red-500 hover:bg-red-50" : "border-line text-foreground/70 hover:border-rose hover:text-rose-deep"}`}>
      {children}
    </button>
  );
}
