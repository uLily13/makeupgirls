"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/(store)/account/actions";

export function ProfileForm({
  email,
  name,
  phone,
}: {
  email: string;
  name: string;
  phone: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ name, phone });
  const [saved, setSaved] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateProfile(form);
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <div className="rounded-2xl border border-line p-6 md:p-8">
      <h2 className="text-lg font-semibold">Хувийн мэдээлэл</h2>
      <form onSubmit={submit} className="mt-5 max-w-md space-y-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">И-мэйл</span>
          <input
            value={email}
            disabled
            className="w-full rounded-xl border border-line bg-gray-50 px-4 py-2.5 text-sm text-muted"
          />
        </label>
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
