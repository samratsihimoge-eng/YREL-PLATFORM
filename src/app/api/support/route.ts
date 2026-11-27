import { NextRequest, NextResponse } from "next/server";
import { Permission, Role } from "node-appwrite";
import { databaseConfig, getUserContext, ID } from "@/lib/server/appwrite";
import { text } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const context = await getUserContext();
  if (!context) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (!["customer", "partner"].includes(context.role)) return NextResponse.json({ error: "Account access required." }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const message = text(body.message, 2000);
  if (!message) return NextResponse.json({ error: "Please enter a message." }, { status: 400 });
  try {
    const db = databaseConfig();
    const ticket = await context.tables.createRow({
      databaseId: db.databaseId, tableId: db.support, rowId: ID.unique(),
      data: { user_id: context.user.$id, booking_id: text(body.booking_id, 80), category: text(body.category, 80) || "general", message, status: "open", assigned_admin: "" },
      permissions: [Permission.read(Role.user(context.user.$id)), Permission.update(Role.user(context.user.$id))],
    });
    return NextResponse.json({ ticket }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Support request could not be saved. Check the Appwrite support table." }, { status: 503 });
  }
}
