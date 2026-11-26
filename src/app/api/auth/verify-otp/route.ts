import { NextRequest, NextResponse } from "next/server";
import { Account, Client, ID, Query, Users } from "node-appwrite";
import { cookies } from "next/headers";
function normalize(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  const local = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(local) ? "+91" + local : null;
}
export async function POST(request: NextRequest) {
  let body: { phone?: string; otp?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const phone = normalize(body.phone);
  const otp = String(body.otp ?? "").trim();
  if (!phone || !/^\d{6}$/.test(otp)) return NextResponse.json({ error: "Enter a valid mobile number and 6-digit OTP." }, { status: 400 });
  const authKey = process.env.MSG91_AUTH_KEY;
  const apiKey = process.env.APPWRITE_API_KEY;
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://sgp.cloud.appwrite.io/v1";
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "6b083d3e000ee339326b";
  if (!authKey || !apiKey) return NextResponse.json({ error: "Authentication is not configured. Add MSG91_AUTH_KEY and APPWRITE_API_KEY in Render." }, { status: 503 });
  try {
    const verifyUrl = new URL("https://control.msg91.com/api/v5/otp/verify");
    verifyUrl.searchParams.set("mobile", phone.slice(1));
    verifyUrl.searchParams.set("otp", otp);
    const response = await fetch(verifyUrl, { headers: { authkey: authKey }, cache: "no-store" });
    const result = await response.json();
    if (!response.ok || result.type !== "success") return NextResponse.json({ error: "OTP is incorrect or expired." }, { status: 401 });
    const adminClient = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
    const users = new Users(adminClient);
    const existing = await users.list({ queries: [Query.equal("phone", phone), Query.limit(1)] });
    const user = existing.users?.[0] ?? await users.create({ userId: ID.unique(), phone, name: "YREL Customer" });
    const token = await users.createToken({ userId: user.$id });
    const sessionClient = new Client().setEndpoint(endpoint).setProject(projectId);
    const session = await new Account(sessionClient).createSession({ userId: user.$id, secret: token.secret });
    const cookieStore = await cookies();
    cookieStore.set("a_session_" + projectId, session.secret, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: new Date(session.expire),
    });
    return NextResponse.json({ ok: true, redirectTo: "/" });
  } catch {
    return NextResponse.json({ error: "OTP verified but sign-in could not be completed. Check Appwrite API key permissions." }, { status: 502 });
  }
}
