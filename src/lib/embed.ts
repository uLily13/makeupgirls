// Parses social video links (Instagram Reels/posts, TikTok, YouTube) into an
// embeddable iframe URL so the storefront can play them inline. Shared by the
// storefront player and the admin editor (for live validation).

export type EmbedPlatform = "instagram" | "tiktok" | "youtube";

export type ParsedEmbed = {
  platform: EmbedPlatform;
  embedUrl: string; // iframe src that plays the clip
  id: string;
};

export function parseEmbed(raw: string): ParsedEmbed | null {
  const url = (raw || "").trim();
  if (!url) return null;

  // Instagram: reel / p / tv → /<type>/<code>/embed
  const ig = url.match(
    /instagram\.com\/(?:[^/]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i
  );
  if (ig) {
    const type = ig[1].toLowerCase() === "reels" ? "reel" : ig[1].toLowerCase();
    return {
      platform: "instagram",
      id: ig[2],
      embedUrl: `https://www.instagram.com/${type}/${ig[2]}/embed`,
    };
  }

  // TikTok: /video/<id> (full URLs — short vm.tiktok.com links can't be resolved client-side)
  const tt = url.match(/tiktok\.com\/(?:@[^/]+\/)?video\/(\d+)/i);
  if (tt) {
    return {
      platform: "tiktok",
      id: tt[1],
      embedUrl: `https://www.tiktok.com/embed/v2/${tt[1]}`,
    };
  }

  // YouTube: watch?v=, youtu.be/, /shorts/, /embed/
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i
  );
  if (yt) {
    return {
      platform: "youtube",
      id: yt[1],
      embedUrl: `https://www.youtube.com/embed/${yt[1]}`,
    };
  }

  return null;
}

export const PLATFORM_LABEL: Record<EmbedPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};
