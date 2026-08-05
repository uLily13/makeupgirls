"use client";

import { useEffect, useRef } from "react";

// A horizontal scroll container that gently auto-advances sideways every few
// seconds to hint that it scrolls. It loops back to the start at the end and
// pauses while the user hovers, touches, or manually scrolls it. Honours
// `prefers-reduced-motion` (stays still). Pass the same flex/overflow classes
// you'd put on the scroller div.
export function AutoScroller({
  className = "",
  children,
  interval = 4200,
}: {
  className?: string;
  children: React.ReactNode;
  interval?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let paused = false;
    let resumeTimer: number | undefined;

    // Resume shortly after the user stops interacting.
    const nudgePause = () => {
      paused = true;
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        paused = false;
      }, 6000);
    };
    const enter = () => {
      paused = true;
    };
    const leave = () => {
      paused = false;
    };

    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("pointerdown", nudgePause);
    el.addEventListener("touchstart", nudgePause, { passive: true });
    el.addEventListener("wheel", nudgePause, { passive: true });

    const tick = window.setInterval(() => {
      if (paused) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 4) return; // nothing meaningful to scroll
      // Advance a little — a bit over half the visible width — then loop.
      const step = Math.min(el.clientWidth * 0.6, 260);
      if (el.scrollLeft >= max - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, interval);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(resumeTimer);
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("pointerdown", nudgePause);
      el.removeEventListener("touchstart", nudgePause);
      el.removeEventListener("wheel", nudgePause);
    };
  }, [interval]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
