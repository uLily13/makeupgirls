"use client";

import { useState, useTransition } from "react";
import { submitFeedback } from "./actions";

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await submitFeedback(form);
      if (res.ok) {
        setDone(true);
        setForm({ name: "", contact: "", message: "" });
      } else setError(res.error ?? "Алдаа гарлаа.");
    });
  };

  if (done) {
    return (
      <div className="glass glass-rim rounded-3xl p-8 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-green-50 text-2xl text-green-600">
          ✓
        </div>
        <h3 className="font-display text-xl">Баярлалаа!</h3>
        <p className="mt-1 text-sm text-muted">
          Таны санал хүсэлтийг хүлээн авлаа.
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-4 rounded-full border border-line px-5 py-2 text-sm"
        >
          Дахин илгээх
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass glass-rim space-y-4 rounded-3xl p-6 md:p-8">
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted">Нэр</span>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputCls}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted">Утас / И-мэйл (заавал биш)</span>
        <input
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
          className={inputCls}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted">Санал хүсэлт</span>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={`${inputCls} resize-none`}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="btn-liquid w-full bg-foreground py-3.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Илгээж байна…" : "Илгээх"}
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-white/60 px-4 py-2.5 text-sm focus:border-rose focus:outline-none";
