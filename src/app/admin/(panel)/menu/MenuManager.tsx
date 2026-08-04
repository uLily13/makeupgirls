"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category, Subcategory } from "@/lib/products";
import { SingleImageUploader } from "@/components/admin/ImageUploader";
import {
  saveCategory,
  toggleCategoryHidden,
  deleteCategory,
  saveSubcategory,
  toggleSubcategoryHidden,
  deleteSubcategory,
} from "../actions";

export function MenuManager({
  categories,
  subcategories,
  counts,
}: {
  categories: Category[];
  subcategories: Subcategory[];
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [catForm, setCatForm] = useState<Category | null>(null);
  const [catIsNew, setCatIsNew] = useState(false);
  const [subForm, setSubForm] = useState<Subcategory | null>(null);
  const [subIsNew, setSubIsNew] = useState(false);

  const run = (fn: () => Promise<void>) =>
    startTransition(async () => {
      setError("");
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Алдаа гарлаа");
      }
    });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Цэс / Ангилал</h1>
          <p className="mt-1 text-muted">Ангилал, дэд ангилал нэмэх, засах, нуух</p>
        </div>
        <button
          onClick={() => {
            setCatIsNew(true);
            setCatForm({ slug: "", name: "", tagline: "", accent: "#d98f97" });
          }}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-deep"
        >
          + Ангилал
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {categories.map((c) => {
          const subs = subcategories.filter((s) => s.category === c.slug);
          return (
            <div
              key={c.slug}
              className={`rounded-2xl border p-5 ${
                c.hidden ? "border-line bg-gray-50 opacity-70" : "border-line bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.image}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span
                      className="h-8 w-8 rounded-full"
                      style={{ background: c.accent }}
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      {c.name}
                      {c.hidden && (
                        <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-500">
                          нуусан
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted">{c.tagline}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Btn
                    onClick={() => {
                      setSubIsNew(true);
                      setSubForm({ slug: "", name: "", category: c.slug });
                    }}
                  >
                    + Дэд ангилал
                  </Btn>
                  <Btn
                    onClick={() => {
                      setCatIsNew(false);
                      setCatForm(c);
                    }}
                  >
                    Засах
                  </Btn>
                  <Btn onClick={() => run(() => toggleCategoryHidden(c.slug))} disabled={pending}>
                    {c.hidden ? "Харуулах" : "Нуух"}
                  </Btn>
                  <Btn
                    danger
                    onClick={() => {
                      if (confirm(`"${c.name}" ангиллыг устгах уу?`))
                        run(() => deleteCategory(c.slug));
                    }}
                    disabled={pending}
                  >
                    Устгах
                  </Btn>
                </div>
              </div>

              {/* Subcategories */}
              {subs.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                  {subs.map((s) => (
                    <div
                      key={s.slug}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                        s.hidden ? "border-line text-muted/60" : "border-line"
                      }`}
                    >
                      <span>{s.name}</span>
                      {counts[s.slug] > 0 && (
                        <span className="rounded-full bg-rose/15 px-1.5 text-[11px] text-rose-deep">
                          {counts[s.slug]}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSubIsNew(false);
                          setSubForm(s);
                        }}
                        className="text-muted hover:text-rose-deep"
                        title="Засах"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => run(() => toggleSubcategoryHidden(s.slug))}
                        className="text-muted hover:text-rose-deep"
                        title={s.hidden ? "Харуулах" : "Нуух"}
                      >
                        {s.hidden ? "◌" : "●"}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`"${s.name}"-г устгах уу?`))
                            run(() => deleteSubcategory(s.slug));
                        }}
                        className="text-muted hover:text-red-500"
                        title="Устгах"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Category form */}
      {catForm && (
        <Overlay onClose={() => setCatForm(null)}>
          <h3 className="font-display text-xl">
            {catIsNew ? "Шинэ ангилал" : "Ангилал засах"}
          </h3>
          <div className="mt-4 space-y-3">
            <Labeled label="Нэр">
              <input
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                className={inputCls}
              />
            </Labeled>
            <Labeled label="Slug (URL)">
              <input
                value={catForm.slug}
                disabled={!catIsNew}
                onChange={(e) =>
                  setCatForm({ ...catForm, slug: e.target.value.trim() })
                }
                className={`${inputCls} ${!catIsNew ? "opacity-60" : ""}`}
              />
            </Labeled>
            <Labeled label="Тайлбар (tagline)">
              <input
                value={catForm.tagline}
                onChange={(e) =>
                  setCatForm({ ...catForm, tagline: e.target.value })
                }
                className={inputCls}
              />
            </Labeled>
            <Labeled label="Өнгө">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={catForm.accent}
                  onChange={(e) =>
                    setCatForm({ ...catForm, accent: e.target.value })
                  }
                  className="h-10 w-14 rounded-lg border border-line"
                />
                <input
                  value={catForm.accent}
                  onChange={(e) =>
                    setCatForm({ ...catForm, accent: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
            </Labeled>
            <Labeled label="Зураг (заавал биш — тавибал нүүр хуудасны хавтан зураг болно)">
              <div className="flex items-center gap-3">
                <SingleImageUploader
                  value={catForm.image}
                  onChange={(url) => setCatForm({ ...catForm, image: url })}
                  size="lg"
                />
                <span className="text-xs text-muted">
                  {catForm.image
                    ? "Зураг тавьсан. Дарж устгана."
                    : "Зураггүй бол одоогийн өнгөт хэлбэрээр харагдана."}
                </span>
              </div>
            </Labeled>
          </div>
          <FormActions
            onCancel={() => setCatForm(null)}
            disabled={pending || !catForm.name || !catForm.slug}
            onSave={() =>
              run(async () => {
                await saveCategory(catForm);
                setCatForm(null);
              })
            }
          />
        </Overlay>
      )}

      {/* Subcategory form */}
      {subForm && (
        <Overlay onClose={() => setSubForm(null)}>
          <h3 className="font-display text-xl">
            {subIsNew ? "Шинэ дэд ангилал" : "Дэд ангилал засах"}
          </h3>
          <div className="mt-4 space-y-3">
            <Labeled label="Нэр">
              <input
                value={subForm.name}
                onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                className={inputCls}
              />
            </Labeled>
            <Labeled label="Slug (URL)">
              <input
                value={subForm.slug}
                disabled={!subIsNew}
                onChange={(e) =>
                  setSubForm({ ...subForm, slug: e.target.value.trim() })
                }
                className={`${inputCls} ${!subIsNew ? "opacity-60" : ""}`}
              />
            </Labeled>
            <Labeled label="Ангилал">
              <select
                value={subForm.category}
                onChange={(e) =>
                  setSubForm({ ...subForm, category: e.target.value })
                }
                className={inputCls}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Labeled>
          </div>
          <FormActions
            onCancel={() => setSubForm(null)}
            disabled={pending || !subForm.name || !subForm.slug}
            onSave={() =>
              run(async () => {
                await saveSubcategory(subForm);
                setSubForm(null);
              })
            }
          />
        </Overlay>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-rose focus:outline-none";

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

function Btn({
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
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${
        danger
          ? "border-red-200 text-red-500 hover:bg-red-50"
          : "border-line text-foreground/70 hover:border-rose hover:text-rose-deep"
      }`}
    >
      {children}
    </button>
  );
}

function FormActions({
  onCancel,
  onSave,
  disabled,
}: {
  onCancel: () => void;
  onSave: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-6 flex justify-end gap-2">
      <button
        onClick={onCancel}
        className="rounded-full border border-line px-5 py-2.5 text-sm"
      >
        Болих
      </button>
      <button
        onClick={onSave}
        disabled={disabled}
        className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Хадгалах
      </button>
    </div>
  );
}

function Overlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 p-4 backdrop-blur-sm">
      <div onClick={onClose} className="absolute inset-0" aria-hidden />
      <div className="relative my-8 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl md:p-8">
        {children}
      </div>
    </div>
  );
}
