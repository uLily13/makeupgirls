"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MNT, type Product, type Category, type Subcategory } from "@/lib/products";
import {
  saveProduct,
  deleteProduct,
  toggleProductHidden,
  startPromotion,
  endPromotion,
  type ProductInput,
} from "../actions";

const BADGES = ["", "Шинэ", "Хит", "Хямдрал"] as const;

type FormState = ProductInput & { ingredientsText: string };

const empty = (): FormState => ({
  slug: "",
  name: "",
  brand: "",
  category: "lips",
  subcategory: "",
  price: 0,
  oldPrice: null,
  rating: 5,
  reviews: 0,
  shade: "#d98f97",
  badge: "",
  short: "",
  description: "",
  ingredientsText: "",
  ingredients: [],
});

export function ProductManager({
  products,
  categories,
  subcategories,
}: {
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [promoFor, setPromoFor] = useState<string | null>(null);
  const [promoPrice, setPromoPrice] = useState("");

  const run = (fn: () => Promise<void>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  const openEdit = (p: Product) => {
    setIsNew(false);
    setForm({
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      category: p.category,
      subcategory: p.subcategory,
      price: p.price,
      oldPrice: p.oldPrice ?? null,
      rating: p.rating,
      reviews: p.reviews,
      shade: p.shade,
      badge: p.badge ?? "",
      short: p.short,
      description: p.description,
      ingredientsText: (p.ingredients ?? []).join(", "),
      ingredients: p.ingredients ?? [],
    });
  };

  const openNew = () => {
    setIsNew(true);
    setForm(empty());
  };

  const submit = () => {
    if (!form) return;
    const input: ProductInput = {
      ...form,
      ingredients: form.ingredientsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    run(async () => {
      await saveProduct(input);
      setForm(null);
    });
  };

  const catName = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Бүтээгдэхүүн</h1>
          <p className="mt-1 text-muted">{products.length} бүтээгдэхүүн</p>
        </div>
        <button
          onClick={openNew}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-deep"
        >
          + Шинэ бүтээгдэхүүн
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line bg-blush/40 text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Бүтээгдэхүүн</th>
              <th className="px-4 py-3 font-semibold">Ангилал</th>
              <th className="px-4 py-3 font-semibold">Үнэ</th>
              <th className="px-4 py-3 font-semibold">Төлөв</th>
              <th className="px-4 py-3 text-right font-semibold">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const onSale = p.oldPrice && p.oldPrice > p.price;
              return (
                <tr key={p.slug} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-9 w-7 shrink-0 rounded-md"
                        style={{ background: p.shade }}
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{p.name}</div>
                        <div className="text-xs text-muted">{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{catName(p.category)}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{MNT(p.price)}</span>
                    {onSale && (
                      <span className="ml-1 text-xs text-muted line-through">
                        {MNT(p.oldPrice!)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.hidden ? (
                        <Tag color="muted">Нуусан</Tag>
                      ) : (
                        <Tag color="green">Идэвхтэй</Tag>
                      )}
                      {onSale && <Tag color="rose">Урамшуулал</Tag>}
                      {p.badge && <Tag color="gold">{p.badge}</Tag>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <MiniBtn onClick={() => openEdit(p)}>Засах</MiniBtn>
                      {onSale ? (
                        <MiniBtn
                          onClick={() => run(() => endPromotion(p.slug))}
                          disabled={pending}
                        >
                          Урамшуулал зогсоох
                        </MiniBtn>
                      ) : (
                        <MiniBtn
                          onClick={() => {
                            setPromoFor(p.slug);
                            setPromoPrice("");
                          }}
                        >
                          Урамшуулал
                        </MiniBtn>
                      )}
                      <MiniBtn
                        onClick={() => run(() => toggleProductHidden(p.slug))}
                        disabled={pending}
                      >
                        {p.hidden ? "Харуулах" : "Нуух"}
                      </MiniBtn>
                      <MiniBtn
                        danger
                        onClick={() => {
                          if (confirm(`"${p.name}"-г устгах уу?`))
                            run(() => deleteProduct(p.slug));
                        }}
                        disabled={pending}
                      >
                        Устгах
                      </MiniBtn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Promotion mini-dialog */}
      {promoFor && (
        <Overlay onClose={() => setPromoFor(null)}>
          <h3 className="font-display text-xl">Урамшуулал зарлах</h3>
          <p className="mt-1 text-sm text-muted">
            Хямдруулсан үнээ оруулна уу. Хуучин үнэ compare-at болж хадгалагдана.
          </p>
          <input
            type="number"
            value={promoPrice}
            onChange={(e) => setPromoPrice(e.target.value)}
            placeholder="Шинэ үнэ (₮)"
            className="mt-4 w-full rounded-xl border border-line px-4 py-2.5 focus:border-rose focus:outline-none"
          />
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setPromoFor(null)}
              className="rounded-full border border-line px-5 py-2 text-sm"
            >
              Болих
            </button>
            <button
              disabled={pending || !promoPrice}
              onClick={() =>
                run(async () => {
                  await startPromotion(promoFor, Number(promoPrice));
                  setPromoFor(null);
                })
              }
              className="rounded-full bg-rose-deep px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Зарлах
            </button>
          </div>
        </Overlay>
      )}

      {/* Product form */}
      {form && (
        <Overlay onClose={() => setForm(null)} wide>
          <h3 className="font-display text-2xl">
            {isNew ? "Шинэ бүтээгдэхүүн" : form.name}
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Нэр">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Slug (URL)">
              <input
                value={form.slug}
                disabled={!isNew}
                onChange={(e) =>
                  setForm({ ...form, slug: e.target.value.trim() })
                }
                className={`${inputCls} ${!isNew ? "opacity-60" : ""}`}
              />
            </Field>
            <Field label="Брэнд">
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Өнгө (swatch)">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.shade}
                  onChange={(e) => setForm({ ...form, shade: e.target.value })}
                  className="h-10 w-14 rounded-lg border border-line"
                />
                <input
                  value={form.shade}
                  onChange={(e) => setForm({ ...form, shade: e.target.value })}
                  className={inputCls}
                />
              </div>
            </Field>
            <Field label="Ангилал">
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value, subcategory: "" })
                }
                className={inputCls}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Дэд ангилал">
              <select
                value={form.subcategory}
                onChange={(e) =>
                  setForm({ ...form, subcategory: e.target.value })
                }
                className={inputCls}
              >
                <option value="">— сонгох —</option>
                {subcategories
                  .filter((s) => s.category === form.category)
                  .map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Үнэ (₮)">
              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                className={inputCls}
              />
            </Field>
            <Field label="Хуучин үнэ (compare-at, заавал биш)">
              <input
                type="number"
                value={form.oldPrice ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    oldPrice: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className={inputCls}
              />
            </Field>
            <Field label="Үнэлгээ (1–5)">
              <input
                type="number"
                step="0.1"
                value={form.rating}
                onChange={(e) =>
                  setForm({ ...form, rating: Number(e.target.value) })
                }
                className={inputCls}
              />
            </Field>
            <Field label="Сэтгэгдлийн тоо">
              <input
                type="number"
                value={form.reviews}
                onChange={(e) =>
                  setForm({ ...form, reviews: Number(e.target.value) })
                }
                className={inputCls}
              />
            </Field>
            <Field label="Тэмдэг (badge)">
              <select
                value={form.badge}
                onChange={(e) =>
                  setForm({ ...form, badge: e.target.value as FormState["badge"] })
                }
                className={inputCls}
              >
                {BADGES.map((b) => (
                  <option key={b} value={b}>
                    {b || "— байхгүй —"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Найрлага (таслалаар)">
              <input
                value={form.ingredientsText}
                onChange={(e) =>
                  setForm({ ...form, ingredientsText: e.target.value })
                }
                className={inputCls}
              />
            </Field>
            <Field label="Богино тайлбар" full>
              <input
                value={form.short}
                onChange={(e) => setForm({ ...form, short: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Дэлгэрэнгүй тайлбар" full>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className={`${inputCls} resize-none`}
              />
            </Field>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setForm(null)}
              className="rounded-full border border-line px-5 py-2.5 text-sm"
            >
              Болих
            </button>
            <button
              disabled={pending || !form.name || !form.slug || form.price <= 0}
              onClick={submit}
              className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {pending ? "Хадгалж байна…" : "Хадгалах"}
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-rose focus:outline-none";

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

function MiniBtn({
  children,
  onClick,
  danger,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${
        danger
          ? "border-red-200 text-red-500 hover:bg-red-50"
          : "border-line text-foreground/70 hover:border-rose hover:text-rose-deep"
      }`}
    >
      {children}
    </button>
  );
}

function Tag({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "green" | "rose" | "gold" | "muted";
}) {
  const map = {
    green: "bg-green-50 text-green-600",
    rose: "bg-rose/15 text-rose-deep",
    gold: "bg-amber-50 text-amber-600",
    muted: "bg-gray-100 text-gray-400",
  };
  return (
    <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${map[color]}`}>
      {children}
    </span>
  );
}

function Overlay({
  children,
  onClose,
  wide,
}: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 p-4 backdrop-blur-sm">
      <div
        onClick={onClose}
        className="absolute inset-0"
        aria-hidden
      />
      <div
        className={`relative my-8 w-full rounded-3xl bg-white p-6 shadow-2xl md:p-8 ${
          wide ? "max-w-2xl" : "max-w-md"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
