"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ContentItem } from "@/lib/products";
import { SingleImageUploader } from "@/components/admin/ImageUploader";
import { updateContent, restoreContent } from "../actions";

export function ContentManager({ items }: { items: ContentItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [historyFor, setHistoryFor] = useState<ContentItem | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    for (const it of items) {
      if (!map.has(it.group)) map.set(it.group, []);
      map.get(it.group)!.push(it);
    }
    return [...map.entries()];
  }, [items]);

  const run = (fn: () => Promise<void>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  const draftOf = (it: ContentItem) => drafts[it.key] ?? it.value;
  const dirty = (it: ContentItem) =>
    drafts[it.key] !== undefined && drafts[it.key] !== it.value;

  return (
    <div>
      <h1 className="font-display text-3xl">Текст контент</h1>
      <p className="mt-1 text-muted">
        Сайтад харагдах текстийг засах. Өөрчлөх бүрд хуучин хувилбар автоматаар
        хадгалагдана.
      </p>

      <div className="mt-8 space-y-10">
        {groups.map(([group, groupItems]) => (
          <section key={group}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-rose-deep">
              {group}
            </h2>
            <div className="space-y-4 rounded-2xl border border-line p-5">
              {groupItems.map((it) => (
                <div
                  key={it.key}
                  className="flex flex-col gap-2 border-b border-line pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted">
                      {it.label}
                    </label>
                    <div className="flex items-center gap-3 text-xs">
                      {it.history && it.history.length > 0 && (
                        <button
                          onClick={() => setHistoryFor(it)}
                          className="text-muted hover:text-rose-deep"
                        >
                          Түүх ({it.history.length})
                        </button>
                      )}
                    </div>
                  </div>
                  {it.image ? (
                    <div className="flex items-center gap-3">
                      {it.value && (
                        <div className="h-16 w-16 overflow-hidden rounded-lg border border-line">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={it.value} alt="" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <SingleImageUploader
                        value={it.value || undefined}
                        onChange={(url) =>
                          run(() => updateContent(it.key, url ?? ""))
                        }
                      />
                      <span className="text-xs text-muted">
                        {it.value ? "Зураг солих / устгах" : "Зураг оруулах"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {it.multiline ? (
                        <textarea
                          rows={2}
                          value={draftOf(it)}
                          onChange={(e) =>
                            setDrafts({ ...drafts, [it.key]: e.target.value })
                          }
                          className={inputCls}
                        />
                      ) : (
                        <input
                          value={draftOf(it)}
                          onChange={(e) =>
                            setDrafts({ ...drafts, [it.key]: e.target.value })
                          }
                          className={inputCls}
                        />
                      )}
                      <button
                        disabled={pending || !dirty(it)}
                        onClick={() =>
                          run(() => updateContent(it.key, draftOf(it)))
                        }
                        className="shrink-0 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-30 sm:self-start"
                      >
                        Хадгалах
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* History dialog */}
      {historyFor && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 p-4 backdrop-blur-sm">
          <div
            onClick={() => setHistoryFor(null)}
            className="absolute inset-0"
            aria-hidden
          />
          <div className="relative my-8 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl md:p-8">
            <h3 className="font-display text-xl">{historyFor.label}</h3>
            <p className="mt-1 text-sm text-muted">Өмнөх хувилбарууд</p>

            <div className="mt-4 rounded-xl bg-blush/40 p-3">
              <div className="text-[11px] uppercase tracking-wide text-rose-deep">
                Одоогийн
              </div>
              <div className="mt-1 text-sm">{historyFor.value}</div>
            </div>

            <ul className="mt-4 space-y-3">
              {(historyFor.history ?? []).map((h, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between gap-3 rounded-xl border border-line p-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm">{h.value}</div>
                    <div className="mt-1 text-[11px] text-muted">
                      {new Date(h.at).toLocaleString("mn-MN")}
                    </div>
                  </div>
                  <button
                    disabled={pending}
                    onClick={() =>
                      run(async () => {
                        await restoreContent(historyFor.key, i);
                        setHistoryFor(null);
                      })
                    }
                    className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:border-rose hover:text-rose-deep"
                  >
                    Сэргээх
                  </button>
                </li>
              ))}
              {(!historyFor.history || historyFor.history.length === 0) && (
                <li className="text-sm text-muted">Түүх алга.</li>
              )}
            </ul>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setHistoryFor(null)}
                className="rounded-full border border-line px-5 py-2.5 text-sm"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-rose focus:outline-none";
