"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adminLogin } from "./actions";

export function AdminLoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await adminLogin(form);
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(res.error ?? "Алдаа гарлаа.");
      }
    });
  };

  return (
    <div className="w-full max-w-sm rounded-3xl border border-line p-8 shadow-sm">
      <div className="mb-6 flex items-baseline gap-2">
        <span className="font-display text-2xl">
          makeup<span className="text-rose">girls</span>
        </span>
        <span className="rounded-md bg-blush px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-deep">
          Admin
        </span>
      </div>
      <h1 className="text-xl font-semibold">Админ нэвтрэх</h1>
      <p className="mt-1 text-sm text-muted">Удирдлагын самбарт нэвтрэнэ үү.</p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="mt-5 space-y-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">И-мэйл</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Нууц үг</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputCls}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-foreground py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Түр хүлээнэ үү…" : "Нэвтрэх"}
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line px-4 py-2.5 text-sm focus:border-rose focus:outline-none";
