"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MNT,
  productBadges,
  type Product,
  type Category,
  type Subcategory,
  type BadgeType,
} from "@/lib/products";
import { ImageUploader, SingleImageUploader } from "@/components/admin/ImageUploader";
import { NumberField } from "@/components/admin/NumberField";
import {
  saveProduct,
  deleteProduct,
  toggleProductHidden,
  startPromotion,
  endPromotion,
  type ProductInput,
} from "../actions";

const BADGE_OPTIONS: BadgeType[] = ["Хит", "Шинэ", "Хямдрал"];

type FormState = ProductInput & { ingredientsText: string };

const empty = (): FormState => ({
  slug: "",
  name: "",
  brand: "",
  category: "lips",
  subcategory: "",
  price: 0,
  oldPrice: null,
  shade: "#d98f97",
  colors: [{ name: "Өнгө 1", hex: "#d98f97" }],
  images: [],
  stock: 0,
  usage: "",
  badges: [],
  bundle: false,
  code: "",
  barcode: "",
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
  const [promoPrice, setPromoPrice] = useState(0);

  // Search & filters
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "hidden" | "sale" | "out" | "bundle"
  >("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q) {
        const hay = `${p.name} ${p.brand} ${p.slug} ${p.code ?? ""} ${p.barcode ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (catFilter !== "all" && p.category !== catFilter) return false;
      const onSale = !!p.oldPrice && p.oldPrice > p.price;
      switch (statusFilter) {
        case "active":
          return !p.hidden;
        case "hidden":
          return !!p.hidden;
        case "sale":
          return onSale;
        case "out":
          return (p.stock ?? 0) <= 0;
        case "bundle":
          return !!p.bundle;
        default:
          return true;
      }
    });
  }, [products, query, catFilter, statusFilter]);

  const hasFilters =
    query.trim() !== "" || catFilter !== "all" || statusFilter !== "all";
  const clearFilters = () => {
    setQuery("");
    setCatFilter("all");
    setStatusFilter("all");
  };

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
      shade: p.shade,
      colors: p.colors?.length ? p.colors : [{ name: "Өнгө 1", hex: p.shade }],
      images: p.images ?? [],
      stock: p.stock ?? 0,
      usage: p.usage ?? "",
      badges: p.badges ?? (p.badge ? [p.badge] : []),
      bundle: p.bundle ?? false,
      code: p.code ?? "",
      barcode: p.barcode ?? "",
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
      images: form.images.filter(Boolean),
      colors: form.colors.filter((c) => c.hex),
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
          <p className="mt-1 text-muted">
            {hasFilters
              ? `${filtered.length} / ${products.length} бүтээгдэхүүн`
              : `${products.length} бүтээгдэхүүн`}
          </p>
        </div>
        <button
          onClick={openNew}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-deep"
        >
          + Шинэ бүтээгдэхүүн
        </button>
      </div>

      {/* Search & filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            ⌕
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Нэр, брэнд, slug-аар хайх…"
            className="w-full rounded-xl border border-line py-2.5 pl-9 pr-3.5 text-sm focus:border-rose focus:outline-none"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className={filterCls}
        >
          <option value="all">Бүх ангилал</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as typeof statusFilter)
          }
          className={filterCls}
        >
          <option value="all">Бүх төлөв</option>
          <option value="active">Идэвхтэй</option>
          <option value="hidden">Нуусан</option>
          <option value="sale">Урамшуулалтай</option>
          <option value="out">Дууссан</option>
          <option value="bundle">Багц</option>
        </select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="rounded-xl border border-line px-3.5 py-2.5 text-sm text-muted hover:border-rose hover:text-rose-deep"
          >
            Цэвэрлэх ✕
          </button>
        )}
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center text-muted">
                  {products.length === 0
                    ? "Бүтээгдэхүүн алга байна."
                    : "Хайлт / шүүлтэд тохирох бүтээгдэхүүн олдсонгүй."}
                </td>
              </tr>
            )}
            {filtered.map((p) => {
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
                      {p.stock <= 0 ? (
                        <Tag color="rose">Дууссан</Tag>
                      ) : (
                        <Tag color="muted">Үлдэгдэл: {p.stock}</Tag>
                      )}
                      {productBadges(p).map((b) => (
                        <Tag key={b} color="gold">
                          {b}
                        </Tag>
                      ))}
                      {p.bundle && <Tag color="rose">Багц</Tag>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <MiniBtn onClick={() => openEdit(p)}>Засах</MiniBtn>
                      {onSale && (
                        <MiniBtn
                          onClick={() => run(() => endPromotion(p.slug))}
                          disabled={pending}
                        >
                          Урамшуулал зогсоох
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
          <NumberField
            value={promoPrice}
            onChange={setPromoPrice}
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
              disabled={pending || promoPrice <= 0}
              onClick={() =>
                run(async () => {
                  await startPromotion(promoFor, promoPrice);
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
            <Field label="Өнгөнүүд (олон өнгө нэмж болно)" full>
              <div className="space-y-2">
                {form.colors.map((col, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={col.hex}
                      onChange={(e) => {
                        const hex = e.target.value;
                        setForm((f) => {
                          if (!f) return f;
                          const colors = [...f.colors];
                          colors[i] = { ...colors[i], hex };
                          return { ...f, colors };
                        });
                      }}
                      className="h-9 w-11 shrink-0 rounded-lg border border-line"
                    />
                    <input
                      value={col.name}
                      placeholder="Өнгөний нэр"
                      onChange={(e) => {
                        const name = e.target.value;
                        setForm((f) => {
                          if (!f) return f;
                          const colors = [...f.colors];
                          colors[i] = { ...colors[i], name };
                          return { ...f, colors };
                        });
                      }}
                      className={inputCls}
                    />
                    <SingleImageUploader
                      value={col.image}
                      onChange={(url) => {
                        // Functional update + latest colors[i] so parallel
                        // image uploads don't clobber each other's data.
                        setForm((f) => {
                          if (!f) return f;
                          const colors = [...f.colors];
                          colors[i] = { ...colors[i], image: url };
                          return { ...f, colors };
                        });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          colors: form.colors.filter((_, j) => j !== i),
                        })
                      }
                      className="shrink-0 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      colors: [
                        ...form.colors,
                        { name: `Өнгө ${form.colors.length + 1}`, hex: "#d98f97" },
                      ],
                    })
                  }
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:border-rose hover:text-rose-deep"
                >
                  + Өнгө нэмэх
                </button>
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
              <NumberField
                value={form.price}
                onChange={(n) => setForm({ ...form, price: n })}
                className={inputCls}
              />
            </Field>
            <Field label="Хуучин үнэ (compare-at, заавал биш)">
              <NumberField
                value={form.oldPrice ?? 0}
                onChange={(n) => setForm({ ...form, oldPrice: n === 0 ? null : n })}
                className={inputCls}
              />
            </Field>
            <Field label="Үлдэгдэл (ширхэг)">
              <NumberField
                value={form.stock}
                onChange={(n) => setForm({ ...form, stock: n })}
                className={inputCls}
              />
            </Field>
            <Field label="Тэмдэг (олон сонгож болно)">
              <div className="flex flex-wrap gap-2">
                {BADGE_OPTIONS.map((b) => {
                  const on = (form.badges ?? []).includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() =>
                        setForm((f) =>
                          f
                            ? {
                                ...f,
                                badges: on
                                  ? (f.badges ?? []).filter((x) => x !== b)
                                  : [...(f.badges ?? []), b],
                              }
                            : f
                        )
                      }
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        on
                          ? "border-rose bg-rose/15 text-rose-deep"
                          : "border-line text-foreground/70 hover:border-rose"
                      }`}
                    >
                      {on ? "✓ " : ""}
                      {b}
                    </button>
                  );
                })}
              </div>
              <span className="mt-1 text-xs text-muted">
                «Хямдрал» нь хуучин үнэ (compare-at) тавихад автоматаар нэмэгдэнэ.
              </span>
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
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-3.5 py-3 sm:col-span-2">
              <input
                type="checkbox"
                checked={!!form.bundle}
                onChange={(e) => setForm({ ...form, bundle: e.target.checked })}
                className="h-4 w-4 accent-rose-deep"
              />
              <span className="text-sm font-medium">
                Багц бүтээгдэхүүн
                <span className="ml-2 font-normal text-muted">
                  (нүүр хуудасны «Багц» табд харагдана)
                </span>
              </span>
            </label>
            <Field label="Бүтээгдэхүүний код (SKU)">
              <input
                value={form.code ?? ""}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="Жишээ: MG-0012"
                className={inputCls}
              />
            </Field>
            <Field label="Баркод (barcode)">
              <input
                value={form.barcode ?? ""}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                placeholder="Жишээ: 4820000000000"
                inputMode="numeric"
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
            <Field label="Хэрэглэх заавар" full>
              <textarea
                rows={2}
                value={form.usage}
                onChange={(e) => setForm({ ...form, usage: e.target.value })}
                className={`${inputCls} resize-none`}
              />
            </Field>
            <Field label="Зураг (олон зураг нэмж болно)" full>
              <ImageUploader
                values={form.images}
                onChange={(urls) =>
                  setForm((f) => (f ? { ...f, images: urls } : f))
                }
              />
              <span className="mt-1 text-xs text-muted">
                1-р зураг картан дээрх үндсэн зураг, 2-р зураг хулгана аваачихад
                харагдах hover зураг, бусад нь дэлгэрэнгүй хуудасны галерейд
                харагдана. Дор хаяж 1 зураг шаардлагатай.
              </span>
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
              disabled={
                pending ||
                !form.name ||
                !form.slug ||
                form.price <= 0 ||
                !form.images[0]
              }
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

const filterCls =
  "rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-foreground/80 focus:border-rose focus:outline-none";

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
