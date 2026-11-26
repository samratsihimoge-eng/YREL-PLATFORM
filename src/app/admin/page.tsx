import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/server/appwrite";
import AdminOverview from "@/components/admin-overview";
export default async function AdminPage() {
 const context=await getUserContext();
 if(!context) redirect("/admin/login");
 if(!context.user.labels?.includes("admin")) redirect("/");
 return <main className="shell"><header className="topbar"><div className="brand">YREL<span>.</span> Admin</div><span className="tag">PRIVATE CONSOLE</span></header><section className="auth-wrap"><span className="eyebrow" style={{color:"#c16c2d"}}>OPERATIONS</span><h1>Admin dashboard</h1><p className="muted">Signed in as {context.user.email||context.user.name||"administrator"}.</p><AdminOverview/></section></main>;
}
