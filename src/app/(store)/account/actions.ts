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
import { applyPromotions } from "@/lib/promotions";
import type { Address, Order, OrderItem, Review, User } from "@/lib/products";

type Result = { ok: boolean; error?: string };

const normPhone = (p: string) => p.replace(/[^\d]/g, "").replace(/^976/, "");
const phoneOk = (p: string) => /^\d{8}$/.test(p);

// ============================ AUTH (phone-based) ============================

export async function register(input: {
  name: string;
  phone: string;
  password: string;
}): Promise<Result> {
  const name = input.name.trim();
  const phone = normPhone(input.phone);
  if (!name) return { ok: false, error: "Нэрээ оруулна уу." };
  if (!phoneOk(phone))
    return { ok: false, error: "Утасны дугаар 8 оронтой байх ёстой." };
  if (input.password.length < 6)
    return { ok: false, error: "Нууц үг доод тал нь 6 тэмдэгт байх ёстой." };

  const store = await getStore();
  if (store.users.some((u) => u.phone === phone))
    return { ok: false, error: "Энэ дугаар бүртгэлтэй байна." };

  const { hash, salt } = hashPassword(input.password);
  const user: User = {
    id: randomUUID(),
    phone,
    name,
    role: "customer",
    passwordHash: hash,
    salt,
    addresses: [],
    favorites: [],
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  await saveStore(store);
  await setSession(user.id);
  return { ok: true };
}

export async function login(input: {
  phone: string;
  password: string;
}): Promise<Result> {
  const phone = normPhone(input.phone);
  const store = await getStore();
  const user = store.users.find((u) => u.phone === phone);
  if (!user || !verifyPassword(input.password, user.passwordHash, user.salt))
    return { ok: false, error: "Утас эсвэл нууц үг буруу байна." };
  await setSession(user.id);
  return { ok: true };
}

export async function logout() {
  await clearSession();
  revalidatePath("/", "layout");
}

async function requireUser() {
  const uid = await getSessionUserId();
  if (!uid) return null;
  const store = await getStore();
  const user = store.users.find((u) => u.id === uid);
  return user ? { store, user } : null;
}

// ============================ PROFILE ============================

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export async function updateProfile(input: {
  name: string;
  phone: string;
  email?: string;
}): Promise<Result> {
  const ctx = await requireUser();
  if (!ctx) return { ok: false, error: "Нэвтэрнэ үү." };

  const email = (input.email ?? "").trim().toLowerCase();
  if (email) {
    if (!emailOk(email))
      return { ok: false, error: "И-мэйл хаяг буруу байна." };
    const taken = ctx.store.users.some(
      (u) => u.id !== ctx.user.id && u.email?.toLowerCase() === email
    );
    if (taken) return { ok: false, error: "Энэ и-мэйл өөр бүртгэлд ашиглагдсан." };
  }

  ctx.user.name = input.name.trim() || ctx.user.name;
  const phone = normPhone(input.phone);
  if (phone && phoneOk(phone)) ctx.user.phone = phone;
  ctx.user.email = email || undefined;
  await saveStore(ctx.store);
  revalidatePath("/account", "layout");
  return { ok: true };
}

// ============================ FAVORITES ============================

export async function toggleFavorite(slug: string): Promise<Result> {
  const ctx = await requireUser();
  if (!ctx) return { ok: false, error: "Нэвтэрнэ үү." };
  const favs = ctx.user.favorites ?? (ctx.user.favorites = []);
  const i = favs.indexOf(slug);
  if (i === -1) favs.push(slug);
  else favs.splice(i, 1);
  await saveStore(ctx.store);
  revalidatePath("/", "layout");
  return { ok: true };
}

// ============================ REVIEWS ============================

export async function addReview(input: {
  slug: string;
  rating: number;
  text: string;
}): Promise<Result> {
  const ctx = await requireUser();
  if (!ctx) return { ok: false, error: "Сэтгэгдэл бичихийн тулд нэвтэрнэ үү." };
  const rating = Math.min(5, Math.max(1, Math.round(input.rating)));
  if (!input.text.trim()) return { ok: false, error: "Сэтгэгдлээ бичнэ үү." };

  const existing = ctx.store.reviews.find(
    (r) => r.productSlug === input.slug && r.userId === ctx.user.id
  );
  if (existing) {
    existing.rating = rating;
    existing.text = input.text.trim();
    existing.createdAt = new Date().toISOString();
  } else {
    const review: Review = {
      id: randomUUID(),
      productSlug: input.slug,
      userId: ctx.user.id,
      userName: ctx.user.name,
      rating,
      text: input.text.trim(),
      createdAt: new Date().toISOString(),
    };
    ctx.store.reviews.push(review);
  }
  await saveStore(ctx.store);
  revalidatePath(`/product/${input.slug}`);
  return { ok: true };
}

// ============================ ADDRESSES ============================

export async function saveAddress(
  input: Omit<Address, "id"> & { id?: string }
): Promise<Result> {
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
  items: { slug: string; qty: number; shade: string; color?: string }[];
  addressId?: string;
  paymentMethod?: string;
}): Promise<{ ok: boolean; error?: string; orderId?: string }> {
  const ctx = await requireUser();
  if (!ctx) return { ok: false, error: "Захиалга хийхийн тулд нэвтэрнэ үү." };
  const { store, user } = ctx;

  if (!input.items.length) return { ok: false, error: "Сагс хоосон байна." };

  // Price from CURRENT store prices; guard against overselling.
  const items: OrderItem[] = [];
  for (const line of input.items) {
    const p = store.products.find((x) => x.slug === line.slug);
    if (!p || p.hidden) continue;
    const qty = Math.max(1, line.qty);
    if (p.stock <= 0)
      return { ok: false, error: `"${p.name}" дууссан байна.` };
    if (qty > p.stock)
      return { ok: false, error: `"${p.name}" — зөвхөн ${p.stock}ш үлдсэн.` };
    items.push({
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      price: p.price,
      qty,
      shade: line.shade,
      color: line.color,
    });
  }
  if (!items.length) return { ok: false, error: "Бүтээгдэхүүн олдсонгүй." };

  // Promotions
  const promo = applyPromotions(
    items.map((i) => ({ slug: i.slug, qty: i.qty, price: i.price })),
    store.promotions,
    store.products
  );
  for (const f of promo.freeItems) {
    const gp = store.products.find((x) => x.slug === f.slug);
    if (gp)
      items.push({
        slug: gp.slug,
        name: gp.name,
        brand: gp.brand,
        price: gp.price,
        qty: f.qty,
        shade: gp.shade,
        free: true,
      });
  }

  const paidSubtotal = items
    .filter((i) => !i.free)
    .reduce((n, i) => n + i.price * i.qty, 0);
  const discount = Math.min(promo.discount, paidSubtotal);
  const net = paidSubtotal - discount;
  const shipping = net >= 100000 ? 0 : 6000;
  const address =
    user.addresses.find((a) => a.id === input.addressId) ??
    user.addresses.find((a) => a.isDefault) ??
    user.addresses[0] ??
    null;

  const order: Order = {
    id: "MG-" + Date.now().toString(36).toUpperCase(),
    userId: user.id,
    items,
    subtotal: paidSubtotal,
    discount,
    shipping,
    total: net + shipping,
    address,
    status: "Хүлээгдэж буй",
    paymentMethod: (["qpay", "khan", "golomt", "card"].includes(
      input.paymentMethod ?? ""
    )
      ? input.paymentMethod
      : undefined) as Order["paymentMethod"],
    createdAt: new Date().toISOString(),
  };
  store.orders.push(order);
  await saveStore(store);
  revalidatePath("/account", "layout");
  return { ok: true, orderId: order.id };
}
