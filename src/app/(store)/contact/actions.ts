"use server";

import { randomUUID } from "crypto";
import { getStore, saveStore } from "@/lib/db";
import type { Feedback } from "@/lib/products";

export async function submitFeedback(input: {
  name: string;
  contact: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const name = input.name.trim();
  const contact = input.contact.trim();
  const message = input.message.trim();
  if (!name || !message)
    return { ok: false, error: "Нэр болон санал хүсэлтээ бичнэ үү." };

  const store = await getStore();
  const fb: Feedback = {
    id: randomUUID(),
    name,
    contact,
    message,
    createdAt: new Date().toISOString(),
    handled: false,
  };
  store.feedback.push(fb);
  await saveStore(store);
  return { ok: true };
}
