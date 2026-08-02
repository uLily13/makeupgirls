import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { saveAsset } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

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
  if (!ALLOWED.includes(file.type)) {
    return Response.json({ error: "Зөвхөн зураг оруулна уу." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Зураг 5MB-ээс бага байх ёстой." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const id = randomUUID();
  await saveAsset(id, file.type, buf);
  return Response.json({ url: `/api/image/${id}` });
}
