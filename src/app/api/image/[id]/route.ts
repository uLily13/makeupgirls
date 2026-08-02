import { getAsset } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(asset.data), {
    headers: {
      "Content-Type": asset.mime,
      // Content-addressed by UUID → safe to cache forever.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
