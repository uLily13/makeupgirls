import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { saveAsset } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"];

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Файл олдсонгүй." }, { status: 400 });
  }
  const isImage = ALLOWED_IMAGE.includes(file.type);
  const isVideo = ALLOWED_VIDEO.includes(file.type);
  if (!isImage && !isVideo) {
    return Response.json(
      { error: "Зөвхөн зураг эсвэл бичлэг (mp4, webm) оруулна уу." },
      { status: 400 }
    );
  }
  if (isImage && file.size > MAX_IMAGE_BYTES) {
    return Response.json({ error: "Зураг 5MB-ээс бага байх ёстой." }, { status: 400 });
  }
  if (isVideo && file.size > MAX_VIDEO_BYTES) {
    return Response.json({ error: "Бичлэг 50MB-ээс бага байх ёстой." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const id = randomUUID();
  await saveAsset(id, file.type, buf);
  return Response.json({ url: `/api/image/${id}` });
}
