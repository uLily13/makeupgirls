"use client";

import { useEffect, useRef, useState } from "react";

// Renders the site logo image from /public/logo.png. Until that file exists
// (or if it fails to load) it gracefully falls back to the styled wordmark, so
// the site never shows a broken image. Drop `logo.png` into /public to switch
// every logo across the site over to the image automatically.
export function Logo({
  imgClass = "",
  fallback,
}: {
  imgClass?: string;
  fallback: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // The image can 404 before React hydrates (so `onError` never fires); catch
  // that on mount by checking a completed-but-empty image.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src="/logo.png"
      alt="makeupgirls.mn"
      className={imgClass}
      onError={() => setFailed(true)}
    />
  );
}
