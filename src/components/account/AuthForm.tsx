"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { login, register } from "@/app/(store)/account/actions";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const isLogin = mode === "login";
  const withNext = (path: string) =>
    next !== "/account" ? `${path}?next=${encodeURIComponent(next)}` : path;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = isLogin
        ? await login({ phone: form.phone, password: form.password })
        : await register(form);
      if (res.ok) {
        router.push(next);
        router.refresh();
      } else {
        setError(res.error ?? "Алдаа гарлаа.");
      }
    });
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16 lg:py-24">
      <div className="glass glass-rim rounded-3xl p-8 md:p-10">
        <h1 className="font-display text-3xl">
          {isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isLogin
            ? "Бүртгэлдээ нэвтэрнэ үү."
            : "Шинэ бүртгэл үүсгээд худалдан авалтаа хялбар болго."}
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          {!isLogin && (
            <Field label="Нэр">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
                placeholder="Таны нэр"
              />
            </Field>
          )}
          <Field label="Утасны дугаар">
            <input
              type="tel"
              required
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputCls}
              placeholder="99xxxxxx"
            />
          </Field>
          <Field label="Нууц үг">
            <input
              type="password"
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputCls}
              placeholder="••••••••"
            />
          </Field>

          <button
            type="submit"
            disabled={pending}
            className="btn-liquid mt-2 w-full bg-foreground py-3.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending
              ? "Түр хүлээнэ үү…"
              : isLogin
                ? "Нэвтрэх"
                : "Бүртгүүлэх"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {isLogin ? (
            <>
              Бүртгэлгүй юу?{" "}
              <Link href={withNext("/register")} className="font-medium text-rose-deep hover:underline">
                Бүртгүүлэх
              </Link>
            </>
          ) : (
            <>
              Бүртгэлтэй юу?{" "}
              <Link href={withNext("/login")} className="font-medium text-rose-deep hover:underline">
                Нэвтрэх
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-white/60 px-4 py-2.5 text-sm focus:border-rose focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
