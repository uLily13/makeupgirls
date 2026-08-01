"use server";

import { revalidatePath } from "next/cache";
import { getStore } from "@/lib/db";
import { verifyPassword, setSession, clearSession } from "@/lib/auth";

export async function adminLogin(input: {
  email: string;
  password: string;
}): Promise<{ ok: boolean; error?: string }> {
  const email = input.email.trim().toLowerCase();
  const store = await getStore();
  const user = store.users.find((u) => u.email === email);
  if (!user || !verifyPassword(input.password, user.passwordHash, user.salt))
    return { ok: false, error: "И-мэйл эсвэл нууц үг буруу байна." };
  if (user.role !== "admin")
    return { ok: false, error: "Танд админ эрх байхгүй байна." };
  await setSession(user.id);
  return { ok: true };
}

export async function adminLogout() {
  await clearSession();
  revalidatePath("/", "layout");
}
