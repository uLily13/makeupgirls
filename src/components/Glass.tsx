"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

/**
 * A frosted "liquid glass" surface whose specular highlight follows the
 * pointer — the same light-reacts-to-motion feel as iOS Liquid Glass.
 */
export function GlassCard({
  children,
  className = "",
  style,
  tilt = false,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  tilt?: boolean;
  as?: "div" | "aside" | "header";
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--mx", `${px}%`);
    el.style.setProperty("--my", `${py}%`);
    if (tilt) {
      const rx = (py / 100 - 0.5) * -8;
      const ry = (px / 100 - 0.5) * 8;
      el.style.setProperty("--rx", `${rx}deg`);
      el.style.setProperty("--ry", `${ry}deg`);
    }
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`glass glass-shine glass-rim ${className}`}
      style={{
        transform: tilt
          ? "perspective(900px) rotateX(var(--rx,0)) rotateY(var(--ry,0))"
          : undefined,
        transition: tilt ? "transform 0.4s var(--ease-out-soft)" : undefined,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
