"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getStore, saveStore } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  setSession,
  clearSession,
  getSessionUserId,
} from "@/lib/auth";
import type { Address, Order, OrderItem, User } from "@/lib/products";

type Result = { ok: boolean; error?: string };

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ============================ AUTH ============================

export async function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<Result> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name) return { ok: false, error: "Нэрээ оруулна уу." };
  if (!emailOk(email)) return { ok: false, error: "И-мэйл буруу байна." };
  if (input.password.length < 6)
    return { ok: false, error: "Нууц үг доод тал нь 6 тэмдэгт байх ёстой." };

  const store = await getStore();
  if (store.users.some((u) => u.email === email))
    return { ok: false, error: "Энэ и-мэйл бүртгэлтэй байна." };

  const { hash, salt } = hashPassword(input.password);
  const user: User = {
    id: randomUUID(),
    email,
    name,
    role: "customer",
    passwordHash: hash,
    salt,
    addresses: [],
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  await saveStore(store);
  await setSession(user.id);
  return { ok: true };
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<Result> {
  const email = input.email.trim().toLowerCase();
  const store = await getStore();
  const user = store.users.find((u) => u.email === email);
  if (!user || !verifyPassword(input.password, user.passwordHash, user.salt))
    return { ok: false, error: "И-мэйл эсвэл нууц үг буруу байна." };
  await setSession(user.id);
  return { ok: true };
}

export async function logout() {
  await clearSession();
  revalidatePath("/", "layout");
}

// ============================ PROFILE ============================

async function requireUser() {
  const uid = await getSessionUserId();
  if (!uid) return null;
  const store = await getStore();
  const user = store.users.find((u) => u.id === uid);
  return user ? { store, user } : null;
}

export async function updateProfile(input: {
  name: string;
  phone: string;
}): Promise<Result> {
  const ctx = await requireUser();
  if (!ctx) return { ok: false, error: "Нэвтэрнэ үү." };
  ctx.user.name = input.name.trim() || ctx.user.name;
  ctx.user.phone = input.phone.trim();
  await saveStore(ctx.store);
  revalidatePath("/account", "layout");
  return { ok: true };
}

// ============================ ADDRESSES ============================

export async function saveAddress(input: Omit<Address, "id"> & { id?: string }): Promise<Result> {
  const ctx = await requireUser();
  if (!ctx) return { ok: false, error: "Нэвтэрнэ үү." };
  const { user, store } = ctx;

  if (input.id) {
    const addr = user.addresses.find((a) => a.id === input.id);
    if (addr) Object.assign(addr, input);
  } else {
    const addr: Address = { ...input, id: randomUUID() };
    if (user.addresses.length === 0) addr.isDefault = true;
    user.addresses.push(addr);
  }
  // Ensure a single default
  if (input.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = a.id === input.id));
  }
  await saveStore(store);
  revalidatePath("/account", "layout");
  return { ok: true };
}

export async function deleteAddress(id: string): Promise<Result> {
  const ctx = await requireUser();
  if (!ctx) return { ok: false, error: "Нэвтэрнэ үү." };
  const wasDefault = ctx.user.addresses.find((a) => a.id === id)?.isDefault;
  ctx.user.addresses = ctx.user.addresses.filter((a) => a.id !== id);
  if (wasDefault && ctx.user.addresses[0]) ctx.user.addresses[0].isDefault = true;
  await saveStore(ctx.store);
  revalidatePath("/account", "layout");
  return { ok: true };
}

export async function setDefaultAddress(id: string): Promise<Result> {
  const ctx = await requireUser();
  if (!ctx) return { ok: false, error: "Нэвтэрнэ үү." };
  ctx.user.addresses.forEach((a) => (a.isDefault = a.id === id));
  await saveStore(ctx.store);
  revalidatePath("/account", "layout");
  return { ok: true };
}

// ============================ ORDERS ============================

export async function placeOrder(input: {
  items: { slug: string; qty: number; shade: string }[];
  addressId?: string;
}): Promise<{ ok: boolean; error?: string; orderId?: string }> {
  const ctx = await requireUser();
  if (!ctx) return { ok: false, error: "Захиалга хийхийн тулд нэвтэрнэ үү." };
  const { store, user } = ctx;

  if (!input.items.length) return { ok: false, error: "Сагс хоосон байна." };

  // Price the order from the CURRENT store prices (never trust the client).
  const items: OrderItem[] = [];
  for (const line of input.items) {
    const p = store.products.find((x) => x.slug === line.slug);
    if (!p) continue;
    items.push({
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      price: p.price,
      qty: Math.max(1, line.qty),
      shade: line.shade,
    });
  }
  if (!items.length) return { ok: false, error: "Бүтээгдэхүүн олдсонгүй." };

  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const shipping = subtotal >= 100000 ? 0 : 6000;
  const address =
    user.addresses.find((a) => a.id === input.addressId) ??
    user.addresses.find((a) => a.isDefault) ??
    user.addresses[0] ??
    null;

  const order: Order = {
    id: "MG-" + Date.now().toString(36).toUpperCase(),
    userId: user.id,
    items,
    subtotal,
    shipping,
    total: subtotal + shipping,
    address,
    status: "Хүлээгдэж буй",
    createdAt: new Date().toISOString(),
  };
  store.orders.push(order);
  await saveStore(store);
  revalidatePath("/account", "layout");
  return { ok: true, orderId: order.id };
}
