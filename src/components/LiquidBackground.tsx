// Fixed, ultra-soft animated color field sitting behind all content.
// Gives the whole site a living, iridescent "liquid" atmosphere.
export function LiquidBackground() {
  const blobs = [
    { c: "var(--rose)", size: 620, top: "-8%", left: "-6%", delay: "0s" },
    { c: "var(--lilac)", size: 520, top: "18%", left: "62%", delay: "-6s" },
    { c: "var(--mint)", size: 480, top: "58%", left: "-4%", delay: "-11s" },
    { c: "var(--blush-deep)", size: 560, top: "72%", left: "58%", delay: "-3s" },
    { c: "var(--gold)", size: 360, top: "40%", left: "34%", delay: "-8s" },
  ];
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 aurora" aria-hidden>
      {blobs.map((b, i) => (
        <span
          key={i}
          style={{
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            background: b.c,
            animationDelay: b.delay,
          }}
        />
      ))}
      {/* subtle top light wash */}
      <div
        className="absolute inset-x-0 top-0 h-1/2"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0))",
        }}
      />
    </div>
  );
}
