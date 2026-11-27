import { NextRequest, NextResponse } from "next/server";
import { createHash, scryptSync, timingSafeEqual } from "node:crypto";
import { Client, Query, TablesDB } from "node-appwrite";
import { createSessionToken, setSessionCookie, databaseConfig } from "@/lib/server/appwrite";

export const runtime = "nodejs";
function normalize(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  const local = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(local) ? "+91" + local : null;
}
function verifyHash(pin: string, stored: string) {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const actual = scryptSync(pin, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return expected.length === actual.length && timingSafeEqual(actual, expected);
  } catch { return false; }
}
export async function POST(request: NextRequest) {
  let body: { phone?: string; passcode?: string; role?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const phone = normalize(body.phone);
  const passcode = String(body.passcode ?? "");
  const role = String(body.role ?? "customer");
  if (!phone || !/^\d{6}$/.test(passcode) || !["customer", "partner", "admin"].includes(role)) {
    return NextResponse.json({ error: "Enter your valid mobile number and six-digit passcode." }, { status: 400 });
  }
  const apiKey = process.env.APPWRITE_API_KEY;
  const secret = process.env.AUTH_SESSION_SECRET ?? process.env.APPWRITE_API_KEY;
  if (!apiKey || !secret || secret.length < 32) return NextResponse.json({ error: "Passcode login is not configured on the server." }, { status: 503 });
  const client = new Client().setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://sgp.cloud.appwrite.io/v1").setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "6b083d3e000ee339326b").setKey(apiKey);
  const tables = new TablesDB(client);
  const db = databaseConfig();
  try {
    const found = await tables.listRows({ databaseId: db.databaseId, tableId: db.credentials, queries: [Query.equal("phone", phone), Query.equal("role", role), Query.limit(1)] });
    const credential = found.rows?.[0] as Record<string, unknown> | undefined;
    if (!credential || credential.locked_until && new Date(String(credential.locked_until)).getTime() > Date.now()) {
      return NextResponse.json({ error: "Mobile number or passcode is incorrect." }, { status: 401 });
    }
    if (!verifyHash(passcode, String(credential.passcode_hash ?? ""))) {
      const attempts = Number(credential.failed_attempts ?? 0) + 1;
      await tables.updateRow({ databaseId: db.databaseId, tableId: db.credentials, rowId: String(credential.$id), data: { failed_attempts: attempts >= 5 ? 0 : attempts, locked_until: attempts >= 5 ? new Date(Date.now() + 15 * 60_000).toISOString() : null } });
      return NextResponse.json({ error: attempts >= 5 ? "Too many attempts. Try again in 15 minutes." : "Mobile number or passcode is incorrect." }, { status: 401 });
    }
    await tables.updateRow({ databaseId: db.databaseId, tableId: db.credentials, rowId: String(credential.$id), data: { failed_attempts: 0, locked_until: null } });
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60_000);
    const token = createSessionToken({ userId: String(credential.user_id), phone, role: role as "customer" | "partner" | "admin", exp: expires.getTime() });
    await setSessionCookie(token, expires);
    return NextResponse.json({ ok: true, redirectTo: role === "admin" ? "/admin" : role === "partner" ? "/partner" : "/" });
  } catch {
    return NextResponse.json({ error: "Sign-in service is unavailable. Check the private auth table and server configuration." }, { status: 503 });
  }
}
