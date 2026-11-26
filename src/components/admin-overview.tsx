"use client";
import { useEffect,useState } from "react";
type Metrics={bookings:number;todayBookings:number;activeDrivers:number;customers:number;openTickets:number;todayRevenue:number};
export default function AdminOverview(){
 const [data,setData]=useState<Metrics|null>(null);const [error,setError]=useState("");const [loading,setLoading]=useState(true);
 useEffect(()=>{fetch("/api/admin/overview",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to load dashboard.");setData(d)}).catch(e=>setError(e instanceof Error?e.message:"Unable to load dashboard.")).finally(()=>setLoading(false))},[]);
 const items=data?[["Today's bookings",String(data.todayBookings)],["Total bookings",String(data.bookings)],["Active drivers",String(data.activeDrivers)],["Customers",String(data.customers)],["Today's recorded revenue","₹"+data.todayRevenue.toLocaleString("en-IN")],["Open support tickets",String(data.openTickets)]]:[];
 return <><div className="dashboard-grid">{loading?Array.from({length:6},(_,i)=><div className="stat" key={i}><strong>—</strong><small>Loading…</small></div>):items.map(([label,value])=><div className="stat" key={label}><strong>{value}</strong><small>{label}</small></div>)}</div>{error&&<p className="notice" style={{marginTop:16}}>{error}</p>}<div className="panel" style={{marginTop:16}}><h2>Operations modules</h2>{[["Bookings","/admin/bookings"],["Drivers & verification","/admin/drivers"],["Customers","/admin/customers"],["Wallet & settlements","/admin/wallet"],["Pricing & packages","/admin/pricing"],["Support tickets","/admin/support"]].map(([label,href])=><a className="list-row" style={{textDecoration:"none",color:"inherit"}} href={href} key={href}><b>{label}</b><span>›</span></a>)}</div></>;
}
