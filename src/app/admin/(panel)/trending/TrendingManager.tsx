"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TrendingPost } from "@/lib/products";
import { parseEmbed, PLATFORM_LABEL } from "@/lib/embed";
import { SingleImageUploader } from "@/components/admin/ImageUploader";
import { saveTrendingPosts } from "../actions";

const newPost = (): TrendingPost => ({
  id:
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
  url: "",
  thumbnail: "",
  caption: "",
});

export function TrendingManager({ posts: initial }: { posts: TrendingPost[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [posts, setPosts] = useState<TrendingPost[]>(initial);
  const [saved, setSaved] = useState(false);

  const patch = (id: string, part: Partial<TrendingPost>) =>
    setPosts((s) => s.map((p) => (p.id === id ? { ...p, ...part } : p)));
  const remove = (id: string) => setPosts((s) => s.filter((p) => p.id !== id));
  const move = (id: string, dir: -1 | 1) =>
    setPosts((s) => {
      const i = s.findIndex((p) => p.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= s.length) return s;
      const next = [...s];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = () =>
    startTransition(async () => {
      await saveTrendingPosts(posts);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Trending / Reels</h1>
          <p className="mt-1 max-w-2xl text-muted">
            Нүүр хуудасны «Trending On Social» хэсэг. Instagram Reel, TikTok
            эсвэл YouTube линк нэмэхэд хэрэглэгч дарж сайт дээр шууд тоглуулна.
            Дурын тооны линк нэмж болно. ({posts.length})
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPosts((s) => [...s, newPost()])}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium hover:border-rose hover:text-rose-deep"
          >
            + Линк нэмэх
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

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center text-muted">
          Линк алга байна. «+ Линк нэмэх» дарж эхлүүлнэ үү.
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map((p, i) => {
            const parsed = parseEmbed(p.url);
            return (
              <div key={p.id} className="rounded-2xl border border-line bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-blush px-3 py-1 text-xs font-semibold text-rose-deep">
                    #{i + 1}
                  </span>
                  <div className="flex gap-1.5">
                    <IconBtn onClick={() => move(p.id, -1)} disabled={i === 0} title="Дээш">
                      ↑
                    </IconBtn>
                    <IconBtn
                      onClick={() => move(p.id, 1)}
                      disabled={i === posts.length - 1}
                      title="Доош"
                    >
                      ↓
                    </IconBtn>
                    <button
                      onClick={() => remove(p.id)}
                      className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                    >
                      Устгах
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row">
                  {/* Cover image */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted">
                      Нүүр зураг (заавал биш)
                    </span>
                    <SingleImageUploader
                      size="lg"
                      value={p.thumbnail || undefined}
                      onChange={(url) => patch(p.id, { thumbnail: url ?? "" })}
                    />
                  </div>

                  {/* Fields */}
                  <div className="grid flex-1 content-start gap-3">
                    <Labeled label="Видео линк (Reel / TikTok / YouTube)">
                      <input
                        value={p.url}
                        onChange={(e) => patch(p.id, { url: e.target.value })}
                        placeholder="https://www.instagram.com/reel/..."
                        className={inputCls}
                      />
                    </Labeled>
                    {p.url.trim() &&
                      (parsed ? (
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                          ✓ {PLATFORM_LABEL[parsed.platform]} — тоглуулахад бэлэн
                        </span>
                      ) : (
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                          ⚠ Линкийг таньсангүй. Reel/TikTok/YouTube-ийн бүтэн
                          хаяг оруулна уу.
                        </span>
                      ))}
                    <Labeled label="Тайлбар (заавал биш)">
                      <input
                        value={p.caption ?? ""}
                        onChange={(e) => patch(p.id, { caption: e.target.value })}
                        className={inputCls}
                      />
                    </Labeled>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-rose focus:outline-none";

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="grid h-7 w-7 place-items-center rounded-lg border border-line text-sm text-foreground/70 transition-colors hover:border-rose hover:text-rose-deep disabled:opacity-30"
    >
      {children}
    </button>
  );
}
