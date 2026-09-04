import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./session";

/**
 * Demo-grade session: a signed, expiring cookie. The brief asks for a single
 * admin / admin login, so there is no user table and no password hashing to do.
 * Before this goes anywhere public it needs real credentials, hashed storage
 * and rate limiting. That is called out in the README.
 */

export { SESSION_COOKIE };

const TTL_MS = 1000 * 60 * 60 * 8;

const ADMIN_USER = process.env.DFG_ADMIN_USER ?? "admin";
const ADMIN_PASS = process.env.DFG_ADMIN_PASS ?? "admin";
const SECRET = process.env.DFG_SESSION_SECRET ?? "dfg-local-demo-secret";

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function createToken(user: string): string {
  const payload = `${user}.${Date.now() + TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [user, expiry, mac] = parts;
  const payload = `${user}.${expiry}`;
  const expected = sign(payload);
  // Constant-time compare so the signature cannot be probed byte by byte.
  if (
    mac.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))
  ) {
    return null;
  }
  if (Number(expiry) < Date.now()) return null;
  return user;
}

export function checkCredentials(user: string, pass: string): boolean {
  return user === ADMIN_USER && pass === ADMIN_PASS;
}

/** Server-side guard for admin pages and admin API routes. */
export async function getSessionUser(): Promise<string | null> {
  const jar = await cookies();
  return verifyToken(jar.get(SESSION_COOKIE)?.value);
}
