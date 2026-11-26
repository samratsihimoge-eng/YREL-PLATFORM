import { NextResponse } from "next/server";
import { Client, Query, TablesDB } from "node-appwrite";
import { getUserContext, databaseConfig } from "@/lib/server/appwrite";

export async function GET() {
  const context = await getUserContext();
  if (!context) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!context.user.labels?.includes("admin")) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const key = process.env.APPWRITE_API_KEY;
  if (!key) return NextResponse.json({ error: "Admin data access is not configured. Add APPWRITE_API_KEY in Render." }, { status: 503 });
  try {
    const client = new Client().setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://sgp.cloud.appwrite.io/v1").setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "6b083d3e000ee339326b").setKey(key);
    const tables = new TablesDB(client);
    const db = databaseConfig();
    const queries = [Query.limit(500)];
    const [bookings, drivers, customers, tickets] = await Promise.all([
      tables.listRows({ databaseId: db.databaseId, tableId: db.bookings, queries }),
      tables.listRows({ databaseId: db.databaseId, tableId: db.drivers, queries }),
      tables.listRows({ databaseId: db.databaseId, tableId: db.customers, queries }),
      tables.listRows({ databaseId: db.databaseId, tableId: db.support, queries }),
    ]);
    const bookingRows = bookings.rows ?? [];
    const driverRows = drivers.rows ?? [];
    const customerRows = customers.rows ?? [];
    const ticketRows = tickets.rows ?? [];
    const today = new Date().toISOString().slice(0,10);
    const todayRows = bookingRows.filter((row: Record<string, unknown>) => String(row.created_at ?? row.$createdAt ?? "").slice(0,10) === today);
    const revenue = todayRows.reduce((sum: number,row: Record<string,unknown>) => sum + Number(row.final_fare || 0),0);
    return NextResponse.json({
      bookings: bookingRows.length,
      todayBookings: todayRows.length,
      activeDrivers: driverRows.filter((row: Record<string,unknown>) => row.is_online === true && row.is_blocked !== true).length,
      customers: customerRows.length,
      openTickets: ticketRows.filter((row: Record<string,unknown>) => row.status === "open").length,
      todayRevenue: revenue,
      sampledRows: true,
    });
  } catch {
    return NextResponse.json({ error: "Could not load admin metrics. Confirm Appwrite table schema and API key scope." }, { status: 503 });
  }
}
