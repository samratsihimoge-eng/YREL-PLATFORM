import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Client, TablesDB, ID } from "node-appwrite";
import { cookies } from "next/headers";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://sgp.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "6b083d3e000ee339326b";
const cookieName = "yrel_session";

type SessionPayload = { userId: string; phone: string; role: "customer" | "partner" | "admin"; exp: number };
function sessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET ?? process.env.APPWRITE_API_KEY;
  if (!secret || secret.length < 32) throw new Error("AUTH_SESSION_SECRET must be at least 32 characters.");
  return secret;
}
function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}
export function createSessionToken(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return body + "." + sign(body);
}
function verifySession(token: string): SessionPayload | null {
  try {
    const [body, signature] = token.split(".");
    if (!body || !signature) return null;
    const expected = Buffer.from(sign(body));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!data.userId || !data.phone || !["customer", "partner", "admin"].includes(data.role) || data.exp <= Date.now()) return null;
    return data;
  } catch { return null; }
}
export async function getUserContext() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (!token) return null;
  const session = verifySession(token);
  if (!session) return null;
  const apiKey = process.env.APPWRITE_API_KEY;
  if (!apiKey) return null;
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const tables = new TablesDB(client);
  const user = { $id: session.userId, phone: session.phone, email: undefined as string | undefined, labels: session.role === "admin" ? ["admin"] : [session.role], name: session.role };
  return { client, user, tables, role: session.role };
}
export async function setSessionCookie(token: string, expires: Date) {
  const jar = await cookies();
  jar.set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires });
}
export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(cookieName, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}
export function databaseConfig() {
  const databaseId = process.env.APPWRITE_DATABASE_ID ?? "yrel-main";
  return {
    databaseId,
    bookings: process.env.APPWRITE_BOOKINGS_TABLE_ID ?? "bookings",
    customers: process.env.APPWRITE_CUSTOMERS_TABLE_ID ?? "customer_profiles",
    drivers: process.env.APPWRITE_DRIVERS_TABLE_ID ?? "driver_profiles",
    trips: process.env.APPWRITE_TRIPS_TABLE_ID ?? "trips",
    seatTrips: process.env.APPWRITE_SEAT_TRIPS_TABLE_ID ?? "seat_share_trips",
    support: process.env.APPWRITE_SUPPORT_TABLE_ID ?? "support_tickets",
    credentials: process.env.APPWRITE_AUTH_CREDENTIALS_TABLE_ID ?? "auth_credentials",
  };
}

export { ID };
