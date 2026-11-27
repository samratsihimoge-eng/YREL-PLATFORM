import { NextRequest, NextResponse } from "next/server";
import { databaseConfig, getUserContext } from "@/lib/server/appwrite";
import { text } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const context = await getUserContext();
  if (!context) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (context.role !== "partner") return NextResponse.json({ error: "Partner access required." }, { status: 403 });
  const db = databaseConfig();
  let body: { online?: boolean };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  try {
    const result = await context.tables.listRows({ databaseId: db.databaseId, tableId: db.drivers });
    const profile = (result.rows ?? []).find((row: Record<string, unknown>) => row.user_id === context.user.$id);
    if (!profile || profile.verification_status !== "verified" || profile.is_blocked === true) {
      return NextResponse.json({ error: "A verified, active partner profile is required." }, { status: 403 });
    }
    if (body.online === true && Number(profile.wallet_balance ?? 0) < -200) {
      return NextResponse.json({ error: "Recharge your wallet before going online." }, { status: 403 });
    }
    const updated = await context.tables.updateRow({
      databaseId: db.databaseId, tableId: db.drivers, rowId: String(profile.$id),
      data: { is_online: Boolean(body.online) },
    });
    return NextResponse.json({ partner: updated });
  } catch {
    return NextResponse.json({ error: "Partner profile update failed. Check Appwrite schema and permissions." }, { status: 503 });
  }
}
