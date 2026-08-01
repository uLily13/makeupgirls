"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Address } from "@/lib/products";
import {
  saveAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/app/(store)/account/actions";

type Form = Omit<Address, "id"> & { id?: string };

const empty = (): Form => ({
  label: "Гэр",
  recipient: "",
  phone: "",
  city: "Улаанбаатар",
  district: "",
  khoroo: "",
  detail: "",
  isDefault: false,
});

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<Form | null>(null);

  const run = (fn: () => Promise<unknown>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Хүргэлтийн хаяг</h2>
        <button
          onClick={() => setForm(empty())}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-deep"
        >
          + Хаяг нэмэх
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-line py-16 text-center text-muted">
          Хадгалсан хаяг алга. Захиалгаа хялбар болгохын тулд хаягаа нэмээрэй.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-2xl border border-line p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-md bg-blush px-2 py-0.5 text-xs font-medium text-rose-deep">
                  {a.label}
                </span>
                {a.isDefault && (
                  <span className="rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                    Үндсэн
                  </span>
                )}
              </div>
              <div className="text-sm font-medium">{a.recipient}</div>
              <div className="text-sm text-muted">{a.phone}</div>
              <div className="mt-2 text-sm text-foreground/80">
                {a.city}, {a.district} дүүрэг, {a.khoroo}-р хороо
                <br />
                {a.detail}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {!a.isDefault && (
                  <button
                    onClick={() => run(() => setDefaultAddress(a.id))}
                    className="rounded-lg border border-line px-3 py-1.5 font-medium hover:border-rose hover:text-rose-deep"
                  >
                    Үндсэн болгох
                  </button>
                )}
                <button
                  onClick={() => setForm({ ...a })}
                  className="rounded-lg border border-line px-3 py-1.5 font-medium hover:border-rose hover:text-rose-deep"
                >
                  Засах
                </button>
                <button
                  onClick={() => {
                    if (confirm("Хаягийг устгах уу?")) run(() => deleteAddress(a.id));
                  }}
                  className="rounded-lg border border-red-200 px-3 py-1.5 font-medium text-red-500 hover:bg-red-50"
                >
                  Устгах
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 p-4 backdrop-blur-sm">
          <div onClick={() => setForm(null)} className="absolute inset-0" aria-hidden />
          <div className="relative my-8 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl md:p-8">
            <h3 className="font-display text-xl">
              {form.id ? "Хаяг засах" : "Шинэ хаяг"}
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <F label="Нэр (Гэр/Ажил)">
                <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className={inputCls} />
              </F>
              <F label="Хүлээн авагч">
                <input value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} className={inputCls} />
              </F>
              <F label="Утас" full>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="99xxxxxx" />
              </F>
              <F label="Хот / аймаг">
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} />
              </F>
              <F label="Дүүрэг / сум">
                <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className={inputCls} />
              </F>
              <F label="Хороо / баг">
                <input value={form.khoroo} onChange={(e) => setForm({ ...form, khoroo: e.target.value })} className={inputCls} />
              </F>
              <F label="Байр, орц, тоот" full>
                <input value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} className={inputCls} />
              </F>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              />
              Үндсэн хаяг болгох
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setForm(null)} className="rounded-full border border-line px-5 py-2.5 text-sm">
                Болих
              </button>
              <button
                disabled={pending || !form.recipient || !form.phone || !form.district}
                onClick={() =>
                  run(async () => {
                    await saveAddress(form);
                    setForm(null);
                  })
                }
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

const inputCls =
  "w-full rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-rose focus:outline-none";

function F({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
