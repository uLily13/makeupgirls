"use client";

import { useEffect } from "react";

// Stops the mouse wheel from changing the value of a focused number input
// (a common annoyance) — the page scrolls instead. Typing still works.
export function NumberInputGuard() {
  useEffect(() => {
    const onWheel = () => {
      const el = document.activeElement;
      if (el instanceof HTMLInputElement && el.type === "number") {
        el.blur();
      }
    };
    document.addEventListener("wheel", onWheel, { passive: true });
    return () => document.removeEventListener("wheel", onWheel);
  }, []);
  return null;
}
