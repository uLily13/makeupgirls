// Renders a product photo when an image URL is present, otherwise a refined
// gradient placeholder — glossy, with a specular highlight and floor reflection.
export function ProductVisual({
  shade,
  image,
  className = "",
}: {
  shade: string;
  image?: string;
  category?: string;
  className?: string;
}) {
  if (image) {
    return (
      <div className={`relative overflow-hidden bg-blush ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background:
          "radial-gradient(130% 130% at 28% 18%, #ffffff 0%, var(--blush) 52%, var(--blush-deep) 100%)",
      }}
    >
      {/* light bloom */}
      <div
        className="absolute -left-10 -top-10 h-40 w-40 rounded-full opacity-70 blur-3xl"
        style={{ background: "#ffffff" }}
      />

      {/* product silhouette */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative flex h-[60%] w-[30%] flex-col items-center">
          <div
            className="h-full w-full rounded-[999px] shadow-[0_22px_50px_-16px_rgba(125,74,92,0.6)]"
            style={{
              background: `linear-gradient(155deg, ${shade} 0%, ${shade} 50%, rgba(0,0,0,0.22) 100%)`,
            }}
          >
            {/* cap sheen */}
            <div className="mx-auto mt-3 h-[13%] w-[46%] rounded-full bg-white/40" />
            {/* vertical specular streak */}
            <div className="ml-[18%] mt-2 h-[55%] w-[10%] rounded-full bg-white/35 blur-[1px]" />
          </div>
          {/* floor reflection */}
          <div
            className="mt-1 h-3 w-[70%] rounded-[50%] opacity-40 blur-md"
            style={{ background: shade }}
          />
        </div>
      </div>
    </div>
  );
}
