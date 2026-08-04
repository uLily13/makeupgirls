"use server";

import { getStore, saveStore } from "@/lib/db";
import type { Subscriber } from "@/lib/products";

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

/** Save a newsletter subscriber's email (footer signup form). */
export async function subscribe(
  email: string
): Promise<{ ok: boolean; error?: string }> {
  const e = email.trim().toLowerCase();
  if (!emailOk(e)) return { ok: false, error: "Зөв имэйл хаяг оруулна уу." };

  const store = await getStore();
  if (!store.subscribers) store.subscribers = [];
  // Idempotent — re-subscribing with the same email is a no-op success.
  if (!store.subscribers.some((s) => s.email === e)) {
    const sub: Subscriber = { email: e, createdAt: new Date().toISOString() };
    store.subscribers.push(sub);
    await saveStore(store);
  }
  return { ok: true };
}
