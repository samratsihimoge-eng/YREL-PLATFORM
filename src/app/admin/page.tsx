import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/server/appwrite";

export default async function AdminPage() {
  const context = await getUserContext();
  if (!context) redirect("/admin/login");
  const labels = String(context.user.labels ?? "");
  if (!labels.split(",").includes("admin")) redirect("/");
  return (
    <main className="shell">
      <header className="topbar"><div className="brand">YREL<span>.</span> Admin</div><span className="tag">Private console</span></header>
      <section className="auth-wrap">
        <span className="eyebrow">OPERATIONS</span>
        <h1>Admin dashboard</h1>
        <p className="muted">Signed in as {context.user.email || context.user.name || "administrator"}.</p>
        <div className="dashboard-grid">
          {["Bookings","Drivers","Customers","Vehicles","Wallet & Settlements","Pricing & Packages","Seat Sharing","Reports & Analytics","Complaints & SOS","Notifications","Settings","Audit Log"].map((item) => <div className="stat" key={item}><strong>—</strong><small>{item}</small></div>)}
        </div>
        <p className="notice" style={{marginTop:16}}>Live management modules are being connected to the protected Appwrite data model. No demo data is shown as real operational data.</p>
      </section>
    </main>
  );
}
