import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ error: "OTP login is paused. Use your six-digit YREL passcode during testing." }, { status: 410 });
}
