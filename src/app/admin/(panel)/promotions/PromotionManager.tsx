"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Promotion, PromotionType } from "@/lib/products";
import { promoGifts } from "@/lib/promotions";
import { NumberField } from "@/components/admin/NumberField";
import { savePromotion, togglePromotion, deletePromotion, type PromotionInput } from "../actions";

const TYPES: { value: PromotionType; label: string; hint: string }[] = [
  { value: "percent", label: "Хувийн хөнгөлөлт", hint: "Сонгосон бүтээгдэхүүнд %-ийн хөнгөлөлт" },
  { value: "amount", label: "Мөнгөн хөнгөлөлт", hint: "Сонгосон бүтээгдэхүүнээс тодорхой ₮ хасна" },
  { value: "bogo", label: "1+N (авбал үнэгүй)", hint: "N авбал M ширхэг үнэгүй" },
  { value: "nth_discount", label: "N авбал дараагийнх нь хямдрах", hint: "N ширхэг авбал (N+1) дэх нь %-аар хямдарна" },
  { value: "gift", label: "Бэлэг дагалдуулах", hint: "A бүтээгдэхүүн авбал B, C… үнэгүй дагалдана" },
  { value: "spend_amount", label: "Дүнгээс хамаарсан хөнгөлөлт", hint: "N₮-с дээш худалдан авалтад N₮ хөнгөлнө" },
  { value: "spend_gift", label: "Дүнгээс хамаарсан бэлэг", hint: "N₮-с дээш худалдан авалтад бэлэг дагалдана" },
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
  gifts: [],
  minQty: 1,
  threshold: 100000,
  startsAt: "",
  endsAt: "",
  banner: false,
  bannerColor: "#171717",
});

// Today + n days as YYYY-MM-DD (for the campaign end date).
const plusDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// "Black Friday" ready-made preset: site-wide 50% off with a countdown banner.
const blackFriday = (): Form => ({
  ...empty(),
  title: "Black Friday",
  type: "percent",
  value: 50,
  productSlugs: [], // бүх бараа
  banner: true,
  bannerColor: "#171717",
  active: true,
  startsAt: plusDays(0),
  endsAt: plusDays(7),
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
  const giftsText = (p: Promotion) =>
    promoGifts(p).map((g) => `${nameOf(g.slug)}${g.qty > 1 ? `×${g.qty}` : ""}`).join(", ");
  const dateText = (p: Promotion) =>
    p.startsAt || p.endsAt ? ` · ${p.startsAt || "…"} — ${p.endsAt || "…"}` : "";

  // ---- gift list helpers (for the form) ----
  const toggleGift = (slug: string, on: boolean) =>
    setForm((f) => {
      if (!f) return f;
      const gifts = f.gifts ?? [];
      return {
        ...f,
        gifts: on
          ? [...gifts, { slug, qty: 1 }]
          : gifts.filter((g) => g.slug !== slug),
      };
    });
  const setGiftQty = (slug: string, qty: number) =>
    setForm((f) =>
      f ? { ...f, gifts: (f.gifts ?? []).map((g) => (g.slug === slug ? { ...g, qty } : g)) } : f
    );

  const t = form?.type;
  const showScope = t === "percent" || t === "amount" || t === "bogo" || t === "nth_discount" || t === "gift";
  const showGifts = t === "gift" || t === "spend_gift";
  const showThreshold = t === "spend_amount" || t === "spend_gift";

  const canSave =
    !!form &&
    !!form.title.trim() &&
    (t !== "gift" || (form.productSlugs.length > 0 && (form.gifts?.length ?? 0) > 0)) &&
    (t !== "spend_gift" || ((form.gifts?.length ?? 0) > 0 && (form.threshold ?? 0) > 0)) &&
    (t !== "spend_amount" || ((form.value ?? 0) > 0 && (form.threshold ?? 0) > 0));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Урамшуулал</h1>
          <p className="mt-1 text-muted">Хөнгөлөлт, 1+N, бэлэг, дүнгээс хамаарсан урамшуулал</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setForm(blackFriday())}
            className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            ⚡ Black Friday
          </button>
          <button
            onClick={() => setForm(empty())}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-deep"
          >
            + Урамшуулал
          </button>
        </div>
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
                  {p.banner && (
                    <span className="rounded-md bg-black px-2 py-0.5 text-[11px] font-medium text-white">
                      ⚡ Баннер
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-muted">
                  {p.type === "percent" && `${p.value}% хөнгөлөлт`}
                  {p.type === "amount" && `${p.value}₮ хасна`}
                  {p.type === "spend_amount" && `${p.threshold}₮-с дээш авбал ${p.value}₮ хөнгөлнө`}
                  {p.type === "bogo" && `${p.buyQty} авбал ${p.freeQty} үнэгүй`}
                  {p.type === "nth_discount" && `${p.buyQty} авбал дараагийнх нь ${p.value}% хямдарна`}
                  {p.type === "gift" &&
                    `${p.productSlugs.map(nameOf).join(", ")} (${p.minQty}ш) авбал "${giftsText(p)}" бэлэг`}
                  {p.type === "spend_gift" && `${p.threshold}₮-с дээш авбал "${giftsText(p)}" бэлэг`}
                  {(p.type === "percent" || p.type === "amount" || p.type === "bogo" || p.type === "nth_discount") &&
                    (p.productSlugs.length > 0 ? ` · ${p.productSlugs.length} бүтээгдэхүүн` : " · бүх бараа")}
                  {dateText(p)}
                </div>
              </div>
              <div className="flex gap-1.5">
                <Btn onClick={() => setForm({ ...empty(), ...p, gifts: promoGifts(p) })}>Засах</Btn>
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
                  {TYPES.map((ty) => (
                    <option key={ty.value} value={ty.value}>{ty.label}</option>
                  ))}
                </select>
                <span className="mt-1 text-xs text-muted">{TYPES.find((ty) => ty.value === form.type)?.hint}</span>
              </L>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-3">
                <L label="Эхлэх огноо (заавал биш)">
                  <input type="date" value={form.startsAt ?? ""} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className={inputCls} />
                </L>
                <L label="Дуусах огноо (заавал биш)">
                  <input type="date" value={form.endsAt ?? ""} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} className={inputCls} />
                </L>
              </div>

              {(form.type === "percent" || form.type === "amount") && (
                <L label={form.type === "percent" ? "Хувь (%)" : "Дүн (₮)"}>
                  <NumberField value={form.value ?? 0} onChange={(n) => setForm({ ...form, value: n })} max={form.type === "percent" ? 100 : undefined} className={inputCls} />
                </L>
              )}

              {showThreshold && (
                <L label="Доод дүн (₮-с дээш авбал)">
                  <NumberField value={form.threshold ?? 0} onChange={(n) => setForm({ ...form, threshold: n })} className={inputCls} />
                </L>
              )}
              {form.type === "spend_amount" && (
                <L label="Хөнгөлөх дүн (₮)">
                  <NumberField value={form.value ?? 0} onChange={(n) => setForm({ ...form, value: n })} className={inputCls} />
                </L>
              )}

              {form.type === "bogo" && (
                <div className="grid grid-cols-2 gap-3">
                  <L label="Авах тоо (N)">
                    <NumberField value={form.buyQty ?? 1} onChange={(n) => setForm({ ...form, buyQty: n })} min={1} className={inputCls} />
                  </L>
                  <L label="Үнэгүй тоо (M)">
                    <NumberField value={form.freeQty ?? 1} onChange={(n) => setForm({ ...form, freeQty: n })} min={1} className={inputCls} />
                  </L>
                </div>
              )}
              {form.type === "nth_discount" && (
                <div className="grid grid-cols-2 gap-3">
                  <L label="Авах тоо (N)">
                    <NumberField value={form.buyQty ?? 2} onChange={(n) => setForm({ ...form, buyQty: n })} min={1} className={inputCls} />
                  </L>
                  <L label="(N+1) дэх нь хямдрах % ">
                    <NumberField value={form.value ?? 0} onChange={(n) => setForm({ ...form, value: n })} max={100} className={inputCls} />
                  </L>
                </div>
              )}

              {form.type === "gift" && (
                <div className="rounded-xl bg-blush/40 p-3 text-xs text-rose-deep">
                  🎁 Доорх <b>А бүтээгдэхүүн(үүд)</b>-ийг авбал сонгосон{" "}
                  <b>бэлэг</b> дагалдана.
                </div>
              )}

              {showScope && (
                <L
                  label={
                    form.type === "gift"
                      ? "А бүтээгдэхүүн — авбал бэлэг дагана (заавал сонгоно)"
                      : "Хамрах бүтээгдэхүүн (хоосон = бүх бараа)"
                  }
                >
                  <div className="max-h-36 space-y-1 overflow-y-auto rounded-xl border border-line p-3">
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
              )}

              {form.type === "gift" && (
                <L label="А-г хэдэн авбал (доод тоо)">
                  <NumberField value={form.minQty ?? 1} onChange={(n) => setForm({ ...form, minQty: n })} min={1} className={inputCls} />
                </L>
              )}

              {showGifts && (
                <L label="Бэлэг бүтээгдэхүүн(үүд) — үнэгүй дагалдана">
                  <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-line p-3">
                    {products.map((p) => {
                      const g = (form.gifts ?? []).find((x) => x.slug === p.slug);
                      return (
                        <div key={p.slug} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={!!g}
                            onChange={(e) => toggleGift(p.slug, e.target.checked)}
                          />
                          <span className="flex-1">{p.name}</span>
                          {g && (
                            <span className="flex items-center gap-1 text-xs text-muted">
                              тоо
                              <NumberField
                                value={g.qty}
                                onChange={(n) => setGiftQty(p.slug, n)}
                                min={1}
                                className="w-16 rounded-lg border border-line px-2 py-1 text-sm"
                              />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </L>
              )}

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Идэвхтэй
              </label>

              {/* Black Friday-style site-wide banner */}
              <div className="rounded-xl border border-line p-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={!!form.banner}
                    onChange={(e) => setForm({ ...form, banner: e.target.checked })}
                  />
                  Сайт даяар том баннер харуулах (Black Friday маягийн)
                </label>
                {form.banner && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={form.bannerColor || "#171717"}
                        onChange={(e) => setForm({ ...form, bannerColor: e.target.value })}
                        className="h-10 w-14 shrink-0 rounded-lg border border-line"
                      />
                      <input
                        value={form.bannerColor || "#171717"}
                        onChange={(e) => setForm({ ...form, bannerColor: e.target.value })}
                        className={inputCls}
                        placeholder="#171717"
                      />
                    </div>
                    <p className="text-xs text-muted">
                      Countdown гарахын тулд «Дуусах огноо»-г оруулна уу. Баннер
                      бүх хуудасны дээд талд харагдана.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setForm(null)} className="rounded-full border border-line px-5 py-2.5 text-sm">Болих</button>
              <button
                disabled={pending || !canSave}
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
