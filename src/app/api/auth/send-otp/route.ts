import { NextRequest, NextResponse } from "next/server";
function normalize(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  const local = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(local) ? "91" + local : null;
}
export async function POST(request: NextRequest) {
  let body: { phone?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const mobile = normalize(body.phone);
  if (!mobile) return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  if (!authKey || !templateId) return NextResponse.json({ error: "OTP is not configured. Add MSG91_AUTH_KEY and MSG91_TEMPLATE_ID in Render." }, { status: 503 });
  try {
    const url = new URL("https://control.msg91.com/api/v5/otp");
    url.searchParams.set("template_id", templateId);
    url.searchParams.set("mobile", mobile);
    url.searchParams.set("otp_length", "6");
    url.searchParams.set("otp_expiry", "5");
    const response = await fetch(url, { method: "POST", headers: { authkey: authKey, "content-type": "application/json" }, body: "{}", cache: "no-store" });
    const result = await response.json();
    if (!response.ok || result.type !== "success") return NextResponse.json({ error: "MSG91 could not send OTP. Check the template, DLT approval and account balance." }, { status: 502 });
    return NextResponse.json({ ok: true, message: "OTP sent." });
  } catch { return NextResponse.json({ error: "OTP service is temporarily unavailable." }, { status: 502 }); }
}
