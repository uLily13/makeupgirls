import { timingSafeEqual, createHmac } from "crypto";
import { cookies } from "next/headers";
import { getStore } from "./db";
import type { SafeUser, User } from "./products";

export { hashPassword, verifyPassword } from "./hash";

// ---------------------------------------------------------------------------
// Lightweight session auth: scrypt-hashed passwords + a signed (HMAC) cookie.
// No external dependencies. For production, move SESSION_SECRET into an env var
// and serve over HTTPS (the cookie is already httpOnly + sameSite=lax).
// ---------------------------------------------------------------------------

const COOKIE = "mg_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const SECRET =
  process.env.SESSION_SECRET ?? "dev-makeupgirls-secret-change-in-production";

// -------- Session token (base64url(payload).signature) --------

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", SECRET).update(payload).digest());
}

export function signSession(uid: string): string {
  const payload = b64url(
    JSON.stringify({ uid, exp: Date.now() + MAX_AGE * 1000 })
  );
  return `${payload}.${sign(payload)}`;
}

export function verifySession(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  // constant-time compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
    );
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return data.uid as string;
  } catch {
    return null;
  }
}

// -------- Cookie helpers (call only inside Server Actions / Route Handlers) --------

export async function setSession(uid: string) {
  const store = await cookies();
  store.set(COOKIE, signSession(uid), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

// -------- Current user --------

export function toSafeUser(u: User): SafeUser {
  const { passwordHash: _p, salt: _s, ...safe } = u;
  void _p;
  void _s;
  return safe;
}

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return verifySession(store.get(COOKIE)?.value);
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const uid = await getSessionUserId();
  if (!uid) return null;
  const data = await getStore();
  const user = data.users.find((u) => u.id === uid);
  return user ? toSafeUser(user) : null;
}
