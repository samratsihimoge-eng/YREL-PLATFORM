import { NextRequest, NextResponse } from "next/server";
import { Permission, Role } from "node-appwrite";
import { databaseConfig, getUserContext, ID } from "@/lib/server/appwrite";
import { number, text, jsonObject } from "@/lib/validation";

export async function GET() {
  const context = await getUserContext();
  if (!context) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const db = databaseConfig();
  try {
    const result = await context.tables.listRows({
      databaseId: db.databaseId,
      tableId: db.bookings,
    });
    const rows = (result.rows ?? []).filter((row: Record<string, unknown>) => row.customer_id === context.user.$id);
    return NextResponse.json({ bookings: rows });
  } catch {
    return NextResponse.json({ error: "Bookings are not available. Check Appwrite table permissions and schema." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const context = await getUserContext();
  if (!context) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const pickup = text(body.pickup, 300), dropoff = text(body.dropoff, 300);
  const distance = number(body.distance_km, 0.1, 5000);
  const fare = number(body.estimated_fare, 0, 1_000_000);
  if (!pickup || !dropoff || distance === null || fare === null) {
    return NextResponse.json({ error: "Pickup, drop-off, valid distance and fare are required." }, { status: 400 });
  }
  const db = databaseConfig();
  const payload = {
    booking_code: `YR-${Date.now().toString(36).toUpperCase()}`,
    customer_id: context.user.$id,
    driver_id: "",
    service_type: text(body.service_type, 40) || "cab",
    vehicle_type: text(body.vehicle_type, 40) || "hatchback",
    pickup, dropoff,
    pickup_lat: number(body.pickup_lat, -90, 90),
    pickup_lon: number(body.pickup_lon ?? body.pickup_lng, -180, 180),
    dropoff_lat: number(body.dropoff_lat, -90, 90),
    dropoff_lon: number(body.dropoff_lon ?? body.dropoff_lng, -180, 180),
    distance_km: distance,
    estimated_fare: fare,
    final_fare: 0,
    status: "requested",
    payment_method: text(body.payment_method, 20) || "cash",
    scheduled_at: text(body.scheduled_at, 60) || new Date().toISOString(),
    booking_details: JSON.stringify(jsonObject(body.booking_details)),
  };
  try {
    const row = await context.tables.createRow({
      databaseId: db.databaseId,
      tableId: db.bookings,
      rowId: ID.unique(),
      data: payload,
      permissions: [
        Permission.read(Role.user(context.user.$id)),
        Permission.update(Role.user(context.user.$id)),
      ],
    });
    return NextResponse.json({ booking: row }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Booking could not be saved. Confirm the Appwrite bookings table columns and user create permission." }, { status: 503 });
  }
}
