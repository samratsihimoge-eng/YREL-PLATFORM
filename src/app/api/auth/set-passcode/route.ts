import { NextRequest, NextResponse } from "next/server";
import { randomBytes, scryptSync } from "node:crypto";
import { Client, ID, Query, TablesDB, Users } from "node-appwrite";
import { databaseConfig } from "@/lib/server/appwrite";

export const runtime = "nodejs";
function normalize(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  const local = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(local) ? "+91" + local : null;
}
export async function POST(request: NextRequest) {
  const setupSecret = process.env.PASSCODE_SETUP_SECRET ?? process.env.APPWRITE_API_KEY;
  const supplied = request.headers.get("x-yrel-setup-key") ?? "";
  if (!setupSecret || setupSecret.length < 24 || supplied.length !== setupSecret.length || supplied !== setupSecret) {
    return NextResponse.json({ error: "Passcode enrollment is restricted to authorized setup." }, { status: 403 });
  }
  let body: { phone?: string; passcode?: string; role?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const phone = normalize(body.phone);
  const passcode = String(body.passcode ?? "");
  const role = String(body.role ?? "customer");
  if (!phone || !/^\d{6}$/.test(passcode) || !["customer", "partner", "admin"].includes(role)) return NextResponse.json({ error: "Valid phone, role and six-digit passcode are required." }, { status: 400 });
  const apiKey = process.env.APPWRITE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Appwrite server key is not configured." }, { status: 503 });
  const client = new Client().setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://sgp.cloud.appwrite.io/v1").setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "6b083d3e000ee339326b").setKey(apiKey);
  try {
    const users = new Users(client);
    const match = await users.list({ queries: [Query.equal("phone", phone), Query.limit(1)] });
    const user = match.users?.[0];
    if (!user) return NextResponse.json({ error: "This phone number is not an existing verified YREL account. Create or verify the account in the admin system first." }, { status: 404 });
    if (role === "admin" && !user.labels?.includes("admin")) return NextResponse.json({ error: "Only an existing administrator can be enrolled as admin." }, { status: 403 });
    const db = databaseConfig();
    const tables = new TablesDB(client);
    const existing = await tables.listRows({ databaseId: db.databaseId, tableId: db.credentials, queries: [Query.equal("phone", phone), Query.equal("role", role), Query.limit(1)] });
    const salt = randomBytes(16).toString("hex");
    const hash = salt + ":" + scryptSync(passcode, salt, 64).toString("hex");
    const data = { phone, user_id: user.$id, role, passcode_hash: hash, failed_attempts: 0, locked_until: null };
    if (existing.rows?.[0]) {
      await tables.updateRow({ databaseId: db.databaseId, tableId: db.credentials, rowId: existing.rows[0].$id, data });
    } else {
      await tables.createRow({ databaseId: db.databaseId, tableId: db.credentials, rowId: ID.unique(), data, permissions: [] });
    }
    return NextResponse.json({ ok: true, message: "Passcode enrolled. Keep the setup key private and remove it after account setup." });
  } catch {
    return NextResponse.json({ error: "Could not enroll passcode. Check Appwrite Users and private credential table permissions." }, { status: 503 });
  }
}
