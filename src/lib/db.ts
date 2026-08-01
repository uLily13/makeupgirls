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
  initialised = true;
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
    createdAt: new Date().toISOString(),
  };
}

function buildSeed(): Store {
  const admin = adminUser();
  return {
    categories: seedCategories.map((c) => ({ ...c })),
    subcategories: seedSubcategories.map((s) => ({ ...s })),
    products: seedProducts.map((p) => ({
      ...p,
      priceHistory: [
        { at: "2026-01-01T00:00:00.000Z", from: null, to: p.price, note: "Анхны үнэ" },
      ],
    })),
    content: seedContent.map((c) => ({ ...c, history: [] })),
    users: admin ? [admin] : [],
    orders: [],
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

  // Back-fill arrays / users added after the store was first seeded.
  if (!store.users) {
    store.users = [];
    changed = true;
  }
  if (!store.orders) {
    store.orders = [];
    changed = true;
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

export function countProductsInSub(store: Store, subSlug: string) {
  return store.products.filter((p) => !p.hidden && p.subcategory === subSlug)
    .length;
}

export async function getContentMap(): Promise<Record<string, string>> {
  return resolveContent(await getStore());
}

export type { ContentItem };
