import { NextRequest, NextResponse } from "next/server";
import { Client, TablesDB, Query } from "node-appwrite";
import { databaseConfig, getUserContext } from "@/lib/server/appwrite";

async function partnerContext() {
  const context = await getUserContext();
  if (!context) return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) } as const;
  const db = databaseConfig();
  const profileResult = await context.tables.listRows({ databaseId: db.databaseId, tableId: db.drivers, queries: [Query.equal("user_id", context.user.$id), Query.limit(1)] });
  const profile = profileResult.rows?.[0];
  if (!profile || profile.verification_status !== "verified" || profile.is_blocked === true) {
    return { error: NextResponse.json({ error: "Verified partner access is required." }, { status: 403 }) } as const;
  }
  const key = process.env.APPWRITE_API_KEY;
  if (!key) return { error: NextResponse.json({ error: "Partner operations are not configured. Add APPWRITE_API_KEY in Render." }, { status: 503 }) } as const;
  const client = new Client().setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://sgp.cloud.appwrite.io/v1").setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "6b083d3e000ee339326b").setKey(key);
  return { context, profile, db, tables: new TablesDB(client) } as const;
}
export async function GET() {
  try {
    const auth = await partnerContext();
    if ("error" in auth) return auth.error;
    const result = await auth.tables.listRows({ databaseId: auth.db.databaseId, tableId: auth.db.bookings, queries: [Query.limit(100)] });
    const rows = (result.rows ?? []).filter((row: Record<string, unknown>) => row.status === "requested" && (!row.driver_id || row.driver_id === auth.context.user.$id) || row.driver_id === auth.context.user.$id);
    return NextResponse.json({ bookings: rows });
  } catch {
    return NextResponse.json({ error: "Could not load trip requests. Check Appwrite permissions and schema." }, { status: 503 });
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const auth = await partnerContext();
    if ("error" in auth) return auth.error;
    let body: { booking_id?: string; action?: string };
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
    const bookingId = String(body.booking_id ?? "").trim();
    const action = String(body.action ?? "");
    if (!bookingId || !["accept", "reject"].includes(action)) return NextResponse.json({ error: "Choose a valid trip request action." }, { status: 400 });
    if (action === "accept" && Number(auth.profile.wallet_balance ?? 0) < -200) return NextResponse.json({ error: "Wallet is below the -₹200 limit. Recharge to accept new trips." }, { status: 403 });
    const current = await auth.tables.getRow({ databaseId: auth.db.databaseId, tableId: auth.db.bookings, rowId: bookingId });
    if (current.status !== "requested" || (current.driver_id && current.driver_id !== auth.context.user.$id)) return NextResponse.json({ error: "This trip is no longer available." }, { status: 409 });
    const updated = await auth.tables.updateRow({ databaseId: auth.db.databaseId, tableId: auth.db.bookings, rowId: bookingId, data: action === "accept" ? { driver_id: auth.context.user.$id, status: "accepted" } : { driver_id: auth.context.user.$id, status: "rejected" } });
    return NextResponse.json({ booking: updated });
  } catch {
    return NextResponse.json({ error: "Trip action failed. Please refresh and try again." }, { status: 503 });
  }
}
