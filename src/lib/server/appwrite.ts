import "server-only";
import { Account, Client, ID, TablesDB } from "node-appwrite";
import { cookies } from "next/headers";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://sgp.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "6b083d3e000ee339326b";

export async function getUserContext() {
  const jar = await cookies();
  const session = jar.get(`a_session_${projectId}`)?.value;
  if (!session) return null;
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setSession(session);
  try {
    const account = new Account(client);
    const user = await account.get();
    return { client, user, tables: new TablesDB(client) };
  } catch {
    return null;
  }
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
  };
}

export { ID };
