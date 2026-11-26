import { NextRequest, NextResponse } from "next/server";
import { Permission, Query, Role } from "node-appwrite";
import { databaseConfig, getUserContext, ID } from "@/lib/server/appwrite";
import { text } from "@/lib/validation";

export async function GET() {
  const context = await getUserContext();
  if (!context) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  try {
    const db = databaseConfig();
    const result = await context.tables.listRows({
      databaseId: db.databaseId,
      tableId: db.customers,
      queries: [Query.equal("user_id", context.user.$id), Query.limit(1)],
    });
    return NextResponse.json({ profile: result.rows?.[0] ?? null });
  } catch {
    return NextResponse.json({ error: "Profile is not available right now." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const context = await getUserContext();
  if (!context) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const fullName = text(body.full_name, 128);
  const phone = text(body.phone, 24);
  const preferredLanguage = text(body.preferred_language, 8) || "en";
  const normalizedPhone = phone.replaceAll(" ", "").replaceAll("-", "");
  const phoneDigits = normalizedPhone.startsWith("+91") ? normalizedPhone.slice(3) : normalizedPhone.startsWith("91") && normalizedPhone.length === 12 ? normalizedPhone.slice(2) : normalizedPhone;
  if (phone && !/^[6-9][0-9]{9}$/.test(phoneDigits)) {
    return NextResponse.json({ error: "Enter a valid Indian mobile number." }, { status: 400 });
  }
  if (!["en", "kn", "hi"].includes(preferredLanguage)) {
    return NextResponse.json({ error: "Unsupported language." }, { status: 400 });
  }

  const db = databaseConfig();
  const data = {
    full_name: fullName,
    phone,
    email: text(body.email, 254) || context.user.email || "",
    preferred_language: preferredLanguage,
  };
  try {
    const existing = await context.tables.listRows({
      databaseId: db.databaseId,
      tableId: db.customers,
      queries: [Query.equal("user_id", context.user.$id), Query.limit(1)],
    });
    const row = existing.rows?.[0];
    if (row) {
      const updated = await context.tables.updateRow({
        databaseId: db.databaseId,
        tableId: db.customers,
        rowId: row.$id,
        data,
      });
      return NextResponse.json({ profile: updated });
    }
    const created = await context.tables.createRow({
      databaseId: db.databaseId,
      tableId: db.customers,
      rowId: ID.unique(),
      data: { ...data, user_id: context.user.$id },
      permissions: [
        Permission.read(Role.user(context.user.$id)),
        Permission.update(Role.user(context.user.$id)),
      ],
    });
    return NextResponse.json({ profile: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Profile could not be saved. Please retry." }, { status: 503 });
  }
}
