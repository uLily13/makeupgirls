"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Subscriber } from "@/lib/products";
import { deleteSubscriber } from "../actions";

export function SubscribersManager({
  subscribers,
}: {
  subscribers: Subscriber[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const copyAll = async () => {
    const text = subscribers.map((s) => s.email).join(", ");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const remove = (email: string) =>
    startTransition(async () => {
      await deleteSubscriber(email);
      router.refresh();
    });

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Имэйл бүртгэл</h1>
          <p className="mt-1 text-muted">
            Newsletter-т бүртгүүлсэн {subscribers.length} имэйл
          </p>
        </div>
        {subscribers.length > 0 && (
          <button
            onClick={copyAll}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-deep"
          >
            {copied ? "Хуулагдлаа ✓" : "Бүгдийг хуулах"}
          </button>
        )}
      </div>

      {subscribers.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white px-6 py-16 text-center text-muted">
          Одоогоор бүртгүүлсэн имэйл алга байна.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[420px] text-sm">
            <thead className="border-b border-line bg-blush/40 text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Имэйл</th>
                <th className="px-4 py-3 font-semibold">Бүртгүүлсэн</th>
                <th className="px-4 py-3 text-right font-semibold">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.email} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium">{s.email}</td>
                  <td className="px-4 py-3 text-muted">{fmt(s.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`"${s.email}"-г устгах уу?`)) remove(s.email);
                      }}
                      disabled={pending}
                      className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-40"
                    >
                      Устгах
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
