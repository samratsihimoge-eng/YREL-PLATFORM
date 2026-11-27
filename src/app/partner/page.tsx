import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/server/appwrite";
import PartnerDashboard from "@/components/partner-dashboard";
export default async function PartnerHome(){const context=await getUserContext();if(!context||context.role!=="partner")redirect("/partner/login");return <PartnerDashboard/>;}