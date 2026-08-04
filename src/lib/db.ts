import { randomUUID } from "crypto";
import { Pool } from "pg";
import {
  categories as seedCategories,
  subcategories as seedSubcategories,
  products as seedProducts,
  type Store,
  type ContentItem,
  type User,
} from "./products";
import { seedContent } from "./content";
import { hashPassword } from "./hash";

// ---------------------------------------------------------------------------
// PostgreSQL persistence. The whole store lives as a single JSONB document in
// one row — the app is built around getStore()/saveStore(), so this keeps that
// API while giving real, deploy-ready durability. Normalise into tables later
// without touching the rest of the app.
// ---------------------------------------------------------------------------

// Reuse a single pool across hot-reloads / serverless invocations.
const globalForPg = globalThis as unknown as { _mgPool?: Pool };
function pool(): Pool {
  if (!globalForPg._mgPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString)
      throw new Error("DATABASE_URL тохируулаагүй байна (.env.local-ыг үзнэ үү).");
    globalForPg._mgPool = new Pool({
      connectionString,
      ssl: connectionString.includes("sslmode=require")
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }
  return globalForPg._mgPool;
}

let initialised = false;
async function ensureTable() {
  if (initialised) return;
  await pool().query(
    `CREATE TABLE IF NOT EXISTS store (
       id INT PRIMARY KEY DEFAULT 1,
       data JSONB NOT NULL,
       updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
       CONSTRAINT single_row CHECK (id = 1)
     )`
  );
  // Uploaded images live in their own table (bytea) so the store document
  // stays small; products only store the /api/image/<id> URL.
  await pool().query(
    `CREATE TABLE IF NOT EXISTS assets (
       id TEXT PRIMARY KEY,
       mime TEXT NOT NULL,
       data BYTEA NOT NULL,
       created_at TIMESTAMPTZ NOT NULL DEFAULT now()
     )`
  );
  initialised = true;
}

// -------- Image assets --------

export async function saveAsset(
  id: string,
  mime: string,
  data: Buffer
): Promise<void> {
  await ensureTable();
  await pool().query(
    "INSERT INTO assets (id, mime, data) VALUES ($1, $2, $3)",
    [id, mime, data]
  );
}

export async function getAsset(
  id: string
): Promise<{ mime: string; data: Buffer } | null> {
  await ensureTable();
  const res = await pool().query<{ mime: string; data: Buffer }>(
    "SELECT mime, data FROM assets WHERE id = $1",
    [id]
  );
  return res.rowCount ? res.rows[0] : null;
}

function adminUser(): User | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return null;
  const { hash, salt } = hashPassword(password);
  return {
    id: randomUUID(),
    email,
    name: "Админ",
    role: "admin",
    passwordHash: hash,
    salt,
    addresses: [],
    favorites: [],
    createdAt: new Date().toISOString(),
  };
}

// Fill in the fields the seed products don't carry.
function normaliseProduct(p: (typeof seedProducts)[number]) {
  const colors = (p.shades ?? [p.shade]).map((hex, i) => ({
    name: `Өнгө ${i + 1}`,
    hex,
  }));
  return {
    ...p,
    colors,
    images: [] as string[],
    stock: 50,
    usage:
      "Цэвэрхэн арьсан дээр зохих хэмжээгээр түрхэж, жигд түгээнэ. Өдөр бүр хэрэглэж болно.",
    priceHistory: [
      { at: "2026-01-01T00:00:00.000Z", from: null as number | null, to: p.price, note: "Анхны үнэ" },
    ],
  };
}

function defaultHeroSlides() {
  return [
    {
      id: randomUUID(),
      image: "",
      badge: "Шинэ улирлын цуглуулга",
      title: "Чиний гоо сайхан,",
      titleAccent: "чиний хэл",
      subtitle:
        "Солонгос болон дэлхийн шилдэг брэндүүдийн гоо сайхны бүтээгдэхүүнийг нэг дороос. Цэвэрхэн, орчин үеийн, чамд зориулсан.",
    },
  ];
}

// Hero content keys that were replaced by the dynamic `heroSlides` array.
const OBSOLETE_HERO_KEYS = new Set([
  "hero.image", "hero.badge", "hero.title", "hero.titleAccent", "hero.subtitle",
  "hero.stat1v", "hero.stat1l", "hero.stat2v", "hero.stat2l", "hero.stat3v", "hero.stat3l",
  "hero.2.image", "hero.2.badge", "hero.2.title", "hero.2.titleAccent", "hero.2.subtitle",
  "hero.3.image", "hero.3.badge", "hero.3.title", "hero.3.titleAccent", "hero.3.subtitle",
]);

function buildSeed(): Store {
  const admin = adminUser();
  return {
    categories: seedCategories.map((c) => ({ ...c })),
    subcategories: seedSubcategories.map((s) => ({ ...s })),
    products: seedProducts.map(normaliseProduct),
    content: seedContent.map((c) => ({ ...c, history: [] })),
    users: admin ? [admin] : [],
    orders: [],
    reviews: [],
    promotions: [],
    feedback: [],
    subscribers: [],
    heroSlides: defaultHeroSlides(),
    updatedAt: new Date().toISOString(),
  };
}

/** Read the whole store, seeding on first run and back-filling new fields. */
export async function getStore(): Promise<Store> {
  await ensureTable();
  const res = await pool().query<{ data: Store }>(
    "SELECT data FROM store WHERE id = 1"
  );

  if (res.rowCount === 0) {
    const seeded = buildSeed();
    await pool().query(
      "INSERT INTO store (id, data) VALUES (1, $1) ON CONFLICT (id) DO NOTHING",
      [JSON.stringify(seeded)]
    );
    return seeded;
  }

  const store = res.rows[0].data;
  let changed = false;

  // Back-fill arrays / fields added after the store was first seeded.
  if (!store.users) { store.users = []; changed = true; }
  if (!store.orders) { store.orders = []; changed = true; }
  if (!store.reviews) { store.reviews = []; changed = true; }
  if (!store.promotions) { store.promotions = []; changed = true; }
  if (!store.feedback) { store.feedback = []; changed = true; }
  if (!store.subscribers) { store.subscribers = []; changed = true; }

  // Migrate the old fixed hero content keys into the dynamic heroSlides array.
  if (!store.heroSlides) {
    const cmap: Record<string, string> = {};
    for (const c of store.content) cmap[c.key] = c.value;
    const mk = (p: string) => ({
      id: randomUUID(),
      image: cmap[`${p}image`] ?? "",
      badge: cmap[`${p}badge`] ?? "",
      title: cmap[`${p}title`] ?? "",
      titleAccent: cmap[`${p}titleAccent`] ?? "",
      subtitle: cmap[`${p}subtitle`] ?? "",
    });
    const s1 = mk("hero.");
    if (!s1.image && !s1.title) {
      Object.assign(s1, defaultHeroSlides()[0], { id: s1.id });
    }
    const s2 = mk("hero.2.");
    const s3 = mk("hero.3.");
    const slides = [s1];
    if (s2.image || s2.title) slides.push(s2);
    if (s3.image || s3.title) slides.push(s3);
    store.heroSlides = slides;
    changed = true;
  }
  // Drop obsolete hero content keys (replaced by heroSlides).
  const beforeLen = store.content.length;
  store.content = store.content.filter((c) => !OBSOLETE_HERO_KEYS.has(c.key));
  if (store.content.length !== beforeLen) changed = true;
  for (const u of store.users) {
    if (!u.favorites) {
      u.favorites = [];
      changed = true;
    }
  }
  for (const p of store.products) {
    if (!p.colors) {
      p.colors = (p.shades ?? [p.shade]).map((hex, i) => ({ name: `Өнгө ${i + 1}`, hex }));
      changed = true;
    }
    if (!p.images) {
      p.images = [];
      changed = true;
    }
    if (typeof p.stock !== "number") {
      p.stock = 50;
      changed = true;
    }
    if (p.usage === undefined) {
      p.usage = "";
      changed = true;
    }
  }
  // Ensure the env admin exists (idempotent by email).
  const admin = adminUser();
  if (admin && !store.users.some((u) => u.email === admin.email)) {
    store.users.push(admin);
    changed = true;
  }
  // Give any pre-role users a role.
  for (const u of store.users) {
    if (!u.role) {
      u.role = "customer";
      changed = true;
    }
  }
  // Back-fill any content keys added to the registry after seeding.
  const existing = new Set(store.content.map((c) => c.key));
  for (const item of seedContent) {
    if (!existing.has(item.key)) {
      store.content.push({ ...item, history: [] });
      changed = true;
    }
  }

  if (changed) await saveStore(store);
  return store;
}

/** Persist the store, stamping updatedAt. */
export async function saveStore(store: Store): Promise<void> {
  await ensureTable();
  store.updatedAt = new Date().toISOString();
  await pool().query(
    `INSERT INTO store (id, data) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = now()`,
    [JSON.stringify(store)]
  );
}

// -------- Read helpers (customer-facing = visible only) --------

export function resolveContent(store: Store): Record<string, string> {
  const map: Record<string, string> = {};
  for (const c of store.content) map[c.key] = c.value;
  return map;
}

export function visibleCategories(store: Store) {
  return store.categories.filter((c) => !c.hidden);
}

export function visibleSubcategories(store: Store, catSlug?: string) {
  return store.subcategories.filter(
    (s) => !s.hidden && (!catSlug || s.category === catSlug)
  );
}

export function visibleProducts(store: Store) {
  return store.products.filter((p) => !p.hidden);
}

/** Products with rating/reviews replaced by values derived from real reviews. */
export function withRatings(store: Store, products = visibleProducts(store)) {
  return products.map((p) => {
    const rs = store.reviews.filter((r) => r.productSlug === p.slug);
    if (rs.length === 0) return { ...p, rating: 0, reviews: 0 };
    const avg = rs.reduce((n, r) => n + r.rating, 0) / rs.length;
    return { ...p, rating: Math.round(avg * 10) / 10, reviews: rs.length };
  });
}

export function countProductsInSub(store: Store, subSlug: string) {
  return store.products.filter((p) => !p.hidden && p.subcategory === subSlug)
    .length;
}

export async function getContentMap(): Promise<Record<string, string>> {
  return resolveContent(await getStore());
}

export type { ContentItem };
