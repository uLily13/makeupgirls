"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PopupSlide } from "@/lib/products";
import { SingleImageUploader } from "@/components/admin/ImageUploader";
import { savePopupSlides } from "../actions";

const newSlide = (): PopupSlide => ({
  id:
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
  image: "",
  title: "",
  subtitle: "",
  link: "",
  linkLabel: "",
});

export function PopupManager({ slides: initial }: { slides: PopupSlide[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [slides, setSlides] = useState<PopupSlide[]>(initial);
  const [saved, setSaved] = useState(false);

  const patch = (id: string, part: Partial<PopupSlide>) =>
    setSlides((s) => s.map((sl) => (sl.id === id ? { ...sl, ...part } : sl)));
  const remove = (id: string) => setSlides((s) => s.filter((sl) => sl.id !== id));
  const move = (id: string, dir: -1 | 1) =>
    setSlides((s) => {
      const i = s.findIndex((sl) => sl.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= s.length) return s;
      const next = [...s];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = () =>
    startTransition(async () => {
      await savePopupSlides(slides);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Нээлтийн попап</h1>
          <p className="mt-1 max-w-2xl text-muted">
            Хэрэглэгч нүүр хуудсанд орох үед гарч ирэх попап (carousel). Зөвхөн
            зураг, эсвэл зураг + гарчиг + тайлбар + холбоос нэмж болно. Слайдгүй
            бол попап гарахгүй. ({slides.length})
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSlides((s) => [...s, newSlide()])}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium hover:border-rose hover:text-rose-deep"
          >
            + Слайд нэмэх
          </button>
          <button
            onClick={save}
            disabled={pending}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-deep disabled:opacity-50"
          >
            {pending ? "Хадгалж байна…" : saved ? "Хадгалагдлаа ✓" : "Хадгалах"}
          </button>
        </div>
      </div>

      {slides.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center text-muted">
          Слайд алга. «+ Слайд нэмэх» дарж эхлүүлнэ үү.
        </div>
      ) : (
        <div className="space-y-5">
          {slides.map((s, i) => (
            <div key={s.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-blush px-3 py-1 text-xs font-semibold text-rose-deep">
                  Слайд {i + 1}
                </span>
                <div className="flex gap-1.5">
                  <IconBtn onClick={() => move(s.id, -1)} disabled={i === 0}>↑</IconBtn>
                  <IconBtn onClick={() => move(s.id, 1)} disabled={i === slides.length - 1}>↓</IconBtn>
                  <button
                    onClick={() => remove(s.id)}
                    className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                  >
                    Устгах
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted">Зураг (заавал биш)</span>
                  <SingleImageUploader
                    size="lg"
                    value={s.image || undefined}
                    onChange={(url) => patch(s.id, { image: url ?? "" })}
                  />
                </div>
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <Labeled label="Гарчиг" full>
                    <input value={s.title} onChange={(e) => patch(s.id, { title: e.target.value })} className={inputCls} />
                  </Labeled>
                  <Labeled label="Тайлбар" full>
                    <textarea rows={2} value={s.subtitle} onChange={(e) => patch(s.id, { subtitle: e.target.value })} className={`${inputCls} resize-none`} />
                  </Labeled>
                  <Labeled label="Холбоос (заавал биш)">
                    <input value={s.link} onChange={(e) => patch(s.id, { link: e.target.value })} placeholder="/shop эсвэл https://…" className={inputCls} />
                  </Labeled>
                  <Labeled label="Товчны текст (заавал биш)">
                    <input value={s.linkLabel} onChange={(e) => patch(s.id, { linkLabel: e.target.value })} placeholder="Дэлгэрэнгүй" className={inputCls} />
                  </Labeled>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-rose focus:outline-none";

function Labeled({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
function IconBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="grid h-7 w-7 place-items-center rounded-lg border border-line text-sm text-foreground/70 transition-colors hover:border-rose hover:text-rose-deep disabled:opacity-30"
    >
      {children}
    </button>
  );
}
