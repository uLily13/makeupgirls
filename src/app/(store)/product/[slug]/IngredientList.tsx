// "Гол найрлага" — a collapsible accordion (same look as "Хэрэглэх заавар"):
// tap the header to expand the ingredient pills.
export function IngredientList({ ingredients }: { ingredients: string[] }) {
  return (
    <details className="group mt-6 rounded-2xl border border-line p-5">
      <summary className="flex cursor-pointer items-center justify-between font-medium">
        Гол найрлага
        <span className="text-muted transition-transform group-open:rotate-180">⌄</span>
      </summary>
      <div className="mt-4 flex flex-wrap gap-2">
        {ingredients.map((ing) => (
          <span
            key={ing}
            className="rounded-full bg-blush px-4 py-2 text-sm text-rose-deep"
          >
            {ing}
          </span>
        ))}
      </div>
    </details>
  );
}
