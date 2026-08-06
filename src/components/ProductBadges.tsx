"use client";

import type { BadgeType } from "@/lib/products";
import { useBadgeSettings } from "@/lib/badgeSettings";

// Renders a product's badges. Each badge's colour and display mode (icon only /
// text only / icon + text) come from the admin-configured badge settings.
const ICONS: Record<BadgeType, React.ReactNode> = {
  Хит: (
    <path d="M12 2s5 4 5 9a5 5 0 01-10 0c0-1.2.4-2.2 1-3 .1 1 .8 1.8 1.7 1.8.9 0 1.3-.7 1.3-1.6C11 6.5 12 4 12 2z" />
  ),
  Шинэ: (
    <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2zM18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14z" />
  ),
  Хямдрал: (
    <path d="M3 12l8-8h7a1 1 0 011 1v7l-8 8a1.5 1.5 0 01-2.1 0L3 14.1a1.5 1.5 0 010-2.1z" />
  ),
};

function Icon({ badge, size }: { badge: BadgeType; size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      style={{ minWidth: size }}
    >
      {ICONS[badge]}
    </svg>
  );
}

export function ProductBadges({
  badges,
  discount = 0,
  className = "",
}: {
  badges: BadgeType[];
  discount?: number;
  className?: string;
}) {
  const settings = useBadgeSettings();
  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-col items-start gap-1.5 ${className}`}>
      {badges.map((b) => {
        const { color, mode } = settings[b];
        const label = b === "Хямдрал" && discount > 0 ? `-${discount}%` : b;

        if (mode === "icon") {
          return (
            <span
              key={b}
              title={b}
              aria-label={b}
              className="[filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.4))]"
              style={{ color }}
            >
              <Icon badge={b} size={24} />
            </span>
          );
        }

        // text / both → coloured pill with white label
        return (
          <span
            key={b}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-[0_4px_12px_-3px_rgba(125,74,92,0.6)]"
            style={{ backgroundColor: color }}
          >
            {mode === "both" && <Icon badge={b} size={13} />}
            {label}
          </span>
        );
      })}
    </div>
  );
}
