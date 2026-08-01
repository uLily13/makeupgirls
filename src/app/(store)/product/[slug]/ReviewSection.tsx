"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Review } from "@/lib/products";
import { addReview } from "@/app/(store)/account/actions";

function Stars({ n, size = 16 }: { n: number; size?: number }) {
  return (
    <span className="text-gold" style={{ fontSize: size }}>
      {"★★★★★".slice(0, Math.round(n))}
      <span className="text-line">{"★★★★★".slice(Math.round(n))}</span>
    </span>
  );
}

export function ReviewSection({
  slug,
  reviews,
  loggedIn,
}: {
  slug: string;
  reviews: Review[];
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const avg =
    reviews.length > 0
      ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length
      : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await addReview({ slug, rating, text });
      if (res.ok) {
        setText("");
        router.refresh();
      } else setError(res.error ?? "Алдаа гарлаа.");
    });
  };

  return (
    <section className="mt-16">
      <div className="mb-6 flex items-baseline gap-3">
        <h2 className="font-display text-2xl">Сэтгэгдэл</h2>
        {reviews.length > 0 && (
          <span className="text-sm text-muted">
            <Stars n={avg} /> {avg.toFixed(1)} · {reviews.length} сэтгэгдэл
          </span>
        )}
      </div>

      {/* Write */}
      {loggedIn ? (
        <form onSubmit={submit} className="mb-8 rounded-2xl border border-line p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-medium">Үнэлгээ:</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="text-2xl leading-none"
                style={{ color: n <= rating ? "var(--gold)" : "var(--line)" }}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Энэ бүтээгдэхүүний талаар сэтгэгдлээ бичнэ үү…"
            className="w-full rounded-xl border border-line px-4 py-2.5 text-sm focus:border-rose focus:outline-none"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="mt-3 rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Илгээж байна…" : "Сэтгэгдэл үлдээх"}
          </button>
        </form>
      ) : (
        <div className="mb-8 rounded-2xl border border-line p-5 text-sm text-muted">
          Сэтгэгдэл бичихийн тулд{" "}
          <Link href="/login" className="font-medium text-rose-deep underline">
            нэвтэрнэ үү
          </Link>
          .
        </div>
      )}

      {/* List */}
      {reviews.length === 0 ? (
        <p className="text-sm text-muted">
          Одоогоор сэтгэгдэл алга. Хамгийн түрүүнд үлдээгээрэй!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((r) => (
              <div key={r.id} className="border-b border-line pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.userName}</span>
                  <span className="text-xs text-muted">
                    {new Date(r.createdAt).toLocaleDateString("mn-MN")}
                  </span>
                </div>
                <Stars n={r.rating} size={14} />
                <p className="mt-1.5 text-sm text-foreground/80">{r.text}</p>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
