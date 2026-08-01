"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Feedback } from "@/lib/products";
import { toggleFeedbackHandled, deleteFeedback } from "../actions";

export function FeedbackManager({ feedback }: { feedback: Feedback[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<void>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl">Санал хүсэлт</h1>
        <p className="mt-1 text-muted">{feedback.length} мессеж</p>
      </div>

      {feedback.length === 0 ? (
        <div className="rounded-2xl border border-line py-16 text-center text-muted">
          Одоогоор санал хүсэлт алга.
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map((f) => (
            <div
              key={f.id}
              className={`rounded-2xl border p-5 ${
                f.handled ? "border-line bg-gray-50 opacity-70" : "border-line"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold">{f.name}</span>
                  {f.contact && (
                    <span className="ml-2 text-sm text-muted">{f.contact}</span>
                  )}
                </div>
                <span className="text-xs text-muted">
                  {new Date(f.createdAt).toLocaleString("mn-MN")}
                </span>
              </div>
              <p className="mt-2 text-sm text-foreground/80">{f.message}</p>
              <div className="mt-3 flex gap-1.5">
                <button
                  onClick={() => run(() => toggleFeedbackHandled(f.id))}
                  disabled={pending}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:border-rose disabled:opacity-40"
                >
                  {f.handled ? "Хийгээгүй болгох" : "Хийсэн"}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Устгах уу?")) run(() => deleteFeedback(f.id));
                  }}
                  disabled={pending}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-40"
                >
                  Устгах
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
