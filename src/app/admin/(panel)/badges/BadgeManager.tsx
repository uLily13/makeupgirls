"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BADGE_ORDER,
  type BadgeSettings,
  type BadgeType,
  type BadgeDisplay,
} from "@/lib/products";
import { saveBadgeSettings } from "../actions";

const MODES: { value: BadgeDisplay; label: string }[] = [
  { value: "icon", label: "Зөвхөн icon" },
  { value: "text", label: "Зөвхөн үг" },
  { value: "both", label: "Icon + үг" },
];

// Small preview of how a badge will look with the chosen colour + mode.
function Preview({
  badge,
  color,
  mode,
}: {
  badge: BadgeType;
  color: string;
  mode: BadgeDisplay;
}) {
  const label = badge === "Хямдрал" ? "-20%" : badge;
  const icon = (
    <svg viewBox="0 0 24 24" fill="currentColor" width={mode === "icon" ? 24 : 14} height={mode === "icon" ? 24 : 14}>
      {badge === "Хит" && (
        <path d="M12 2s5 4 5 9a5 5 0 01-10 0c0-1.2.4-2.2 1-3 .1 1 .8 1.8 1.7 1.8.9 0 1.3-.7 1.3-1.6C11 6.5 12 4 12 2z" />
      )}
      {badge === "Шинэ" && (
        <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2zM18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14z" />
      )}
      {badge === "Хямдрал" && (
        <path d="M3 12l8-8h7a1 1 0 011 1v7l-8 8a1.5 1.5 0 01-2.1 0L3 14.1a1.5 1.5 0 010-2.1z" />
      )}
    </svg>
  );
  return (
    <div className="grid h-16 w-16 place-items-center rounded-xl border border-line bg-blush/40">
      {mode === "icon" ? (
        <span className="[filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.4))]" style={{ color }}>
          {icon}
        </span>
      ) : (
        <span
          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {mode === "both" && icon}
          {label}
        </span>
      )}
    </div>
  );
}

export function BadgeManager({ settings: initial }: { settings: BadgeSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [settings, setSettings] = useState<BadgeSettings>(initial);
  const [saved, setSaved] = useState(false);

  const patch = (b: BadgeType, part: Partial<BadgeSettings[BadgeType]>) =>
    setSettings((s) => ({ ...s, [b]: { ...s[b], ...part } }));

  const save = () =>
    startTransition(async () => {
      await saveBadgeSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Тэмдэг (badge)</h1>
          <p className="mt-1 max-w-2xl text-muted">
            Бүтээгдэхүүн дээрх тэмдгүүдийн өнгө болон харагдах хэлбэрийг
            (зөвхөн icon / зөвхөн үг / icon+үг) тохируулна.
          </p>
        </div>
        <button
          onClick={save}
          disabled={pending}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-deep disabled:opacity-50"
        >
          {pending ? "Хадгалж байна…" : saved ? "Хадгалагдлаа ✓" : "Хадгалах"}
        </button>
      </div>

      <div className="space-y-4">
        {BADGE_ORDER.map((b) => {
          const st = settings[b];
          return (
            <div
              key={b}
              className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center"
            >
              <Preview badge={b} color={st.color} mode={st.mode} />

              <div className="flex-1">
                <div className="mb-3 font-medium">
                  {b}
                  {b === "Хямдрал" && (
                    <span className="ml-2 text-xs font-normal text-muted">
                      («Зөвхөн үг» / «Icon+үг» үед хямдралын хувь -N% харагдана)
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-muted">Өнгө</span>
                    <input
                      type="color"
                      value={st.color}
                      onChange={(e) => patch(b, { color: e.target.value })}
                      className="h-9 w-12 rounded-lg border border-line"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MODES.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => patch(b, { mode: m.value })}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                          st.mode === m.value
                            ? "border-rose bg-rose/15 text-rose-deep"
                            : "border-line text-foreground/70 hover:border-rose"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
