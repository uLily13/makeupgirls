"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/(store)/account/actions";

export function ProfileForm({
  name,
  phone,
  email,
}: {
  name: string;
  phone: string;
  email: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ name, phone, email });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setError("");
    startTransition(async () => {
      const res = await updateProfile(form);
      if (res.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setError(res.error ?? "Алдаа гарлаа");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-line p-6 md:p-8">
      <h2 className="text-lg font-semibold">Хувийн мэдээлэл</h2>
      <form onSubmit={submit} className="mt-5 max-w-md space-y-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Нэр</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Утас</span>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputCls}
            placeholder="99xxxxxx"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">И-мэйл</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls}
            placeholder="name@example.com"
          />
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Хадгалж байна…" : "Хадгалах"}
          </button>
          {saved && <span className="text-sm text-green-600">✓ Хадгалагдлаа</span>}
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line px-4 py-2.5 text-sm focus:border-rose focus:outline-none";
