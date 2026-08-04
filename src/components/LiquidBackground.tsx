// A calm, static coral wash behind all content. The flat coral design keeps
// the page bright and image-forward, so the old animated "liquid glass" blobs
// are replaced by a single soft blush gradient at the very top.
export function LiquidBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden
      style={{
        background:
          "linear-gradient(180deg, var(--blush) 0%, rgba(255,255,255,0) 40%)",
      }}
    />
  );
}
