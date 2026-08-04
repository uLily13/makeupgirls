"use client";

import { useState } from "react";

// "Гол найрлага" — shows a few ingredient pills by default and collapses the
// rest behind a toggle so a long list doesn't flood the product page.
const PREVIEW = 6;

export function IngredientList({ ingredients }: { ingredients: string[] }) {
  const [open, setOpen] = useState(false);
  const collapsible = ingredients.length > PREVIEW;
  const shown = open || !collapsible ? ingredients : ingredients.slice(0, PREVIEW);
  const hidden = ingredients.length - PREVIEW;

  return (
    <div className="mt-10">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
        Гол найрлага
      </h3>
      <div className="flex flex-wrap gap-2">
        {shown.map((ing) => (
          <span
            key={ing}
            className="rounded-full bg-blush px-4 py-2 text-sm text-rose-deep"
          >
            {ing}
          </span>
        ))}
      </div>
      {collapsible && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-rose-deep hover:text-rose"
        >
          {open ? "Хураах" : `Бүгдийг харах (+${hidden})`}
          <span className={`transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
        </button>
      )}
    </div>
  );
}
