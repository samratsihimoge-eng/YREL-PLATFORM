import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "YREL Platform",
    integrations: {
      appwrite: Boolean(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID),
      otpProvider: Boolean(process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID),
    },
  });
}
