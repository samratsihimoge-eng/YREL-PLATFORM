"use client";
import { useMemo, useState } from "react";

type RequestItem = { id: string; pickup: string; drop: string; km: string; fare: number };
const seed: RequestItem[] = [
  { id: "YR-24081", pickup: "Indiranagar, Bengaluru", drop: "Kempegowda International Airport", km: "36.4 km", fare: 920 },
  { id: "YR-24082", pickup: "MG Road, Bengaluru", drop: "Whitefield", km: "18.2 km", fare: 465 },
];
const rupees = (value: number) => "₹" + value.toLocaleString("en-IN");

export default function PartnerDashboard() {
  const [online, setOnline] = useState(false);
  const [tab, setTab] = useState("Home");
  const [requests, setRequests] = useState(seed);
  const [balance, setBalance] = useState(460);
  const [amount, setAmount] = useState(200);
  const [message, setMessage] = useState("");
  const [partnerName, setPartnerName] = useState("YREL Partner");
  const [vehicle, setVehicle] = useState("Sedan · KA 03 MN 4821");
  const today = useMemo(() => new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" }), []);

  const accept = (id: string) => { setRequests(items => items.filter(item => item.id !== id)); setMessage("Preview only: dispatch must be connected before real trips can be accepted."); };
  const decline = (id: string) => setRequests(items => items.filter(item => item.id !== id));
  const recharge = () => { if (amount < 100) { setMessage("Minimum recharge is ₹100."); return; } setMessage("Preview only: payment gateway is not connected. No payment was taken."); };

  return <main className="partner-shell">
    <style jsx>{`
      .partner-shell{min-height:100vh;background:#fff8ef;color:#29231d;padding:22px 18px 100px;font-family:Arial,sans-serif}
      .inner{max-width:760px;margin:auto}.head{display:flex;justify-content:space-between;align-items:center}.brand{font-size:23px;font-weight:900;letter-spacing:-1px}.brand span{color:#ed792b}.label{font-size:10px;letter-spacing:1.5px;color:#a08f7c;font-weight:800;margin-top:5px}
      .avatar{width:42px;height:42px;border-radius:50%;background:#f9dfc9;color:#a94e14;display:grid;place-items:center;font-weight:900}
      .intro{margin:30px 0 18px}.intro h1{font-size:28px;letter-spacing:-1px;margin:7px 0}.muted{color:#918575;font-size:13px;line-height:1.55}
      .status{border-radius:19px;background:#29231d;color:white;padding:17px;display:flex;justify-content:space-between;align-items:center;gap:10px}.status strong{display:block;font-size:15px;margin-bottom:5px}.status small{color:#d6cabe;font-size:11px}
      button{cursor:pointer;font:inherit}.toggle,.primary{border:0;border-radius:12px;padding:12px 15px;background:#ed792b;color:white;font-size:12px;font-weight:900}.toggle.off{background:#eee5d9;color:#5c5043}
      .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}.card{background:white;border:1px solid #eee4d8;border-radius:17px;padding:15px}.stat-label{font-size:10px;color:#a08f7c;font-weight:800;letter-spacing:1px}.stat-value{font-size:22px;font-weight:900;margin:9px 0 4px}.stat-foot{font-size:10px;color:#918575}
      .section-head{display:flex;align-items:center;justify-content:space-between;margin:25px 0 12px}.section-head h2{font-size:17px;margin:0}.link{border:0;background:none;color:#d9631e;font-size:12px;font-weight:800}
      .request{background:white;border:1px solid #eee4d8;border-radius:17px;padding:15px;margin-bottom:11px}.request-top{display:flex;justify-content:space-between;gap:8px}.fare{font-size:21px;font-weight:900;color:#d9631e;margin-top:6px}.route{margin:17px 0 14px;padding-left:12px;border-left:2px dotted #ed792b}.route b{display:block;font-size:13px;margin:0 0 14px}.route b:last-child{margin:0}.actions{display:flex;gap:8px}.secondary{border:0;border-radius:11px;padding:12px 15px;background:#f4ede3;color:#5e5144;font-weight:800}.primary{flex:1}
      .rows{background:white;border:1px solid #eee4d8;border-radius:17px;padding:0 15px}.row{display:flex;align-items:center;gap:12px;padding:15px 0;border-bottom:1px solid #f0e9df}.row:last-child{border:0}.icon{width:37px;height:37px;border-radius:12px;background:#fff0e3;color:#d9631e;display:grid;place-items:center;font-weight:900}.row-main{flex:1}.row-main b{display:block;font-size:13px}.row-main small{color:#978b7b;font-size:11px}
      .field{width:100%;padding:13px;border:1px solid #e9dfd2;border-radius:11px;margin:7px 0 14px;background:white;color:#29231d}.quick{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0}.quick button{border:1px solid #eee4d8;border-radius:10px;padding:10px;background:#fff;color:#5e5144;font-weight:800}.quick button.selected{border:2px solid #ed792b;color:#d9631e}
      .bottom{position:fixed;bottom:0;left:0;right:0;background:#fffdf9ed;border-top:1px solid #eee4d8;display:flex;justify-content:center;padding:8px 3px max(8px,env(safe-area-inset-bottom));z-index:5}.bottom-inner{width:min(100%,760px);display:grid;grid-template-columns:repeat(6,1fr)}.nav{border:0;background:none;color:#968b7e;font-size:10px;padding:5px 1px}.nav span{display:block;font-size:17px;margin-bottom:4px}.nav.active{color:#df6a22;font-weight:900}
      .notice{position:fixed;top:14px;left:50%;transform:translateX(-50%);background:#29231d;color:white;border-radius:12px;padding:12px 15px;font-size:12px;z-index:20;max-width:92vw;border:0}
      .empty{text-align:center;color:#918575;padding:25px;font-size:13px}
      @media(max-width:520px){.partner-shell{padding:18px 14px 96px}.stats{grid-template-columns:1fr 1fr}.stats .card:last-child{grid-column:span 2}.intro h1{font-size:25px}.status{padding:14px}.toggle{padding:11px}}
    `}</style>
    {message && <button className="notice" onClick={() => setMessage("")}>{message}　×</button>}
    <div className="inner">
      <header className="head"><div><div className="brand">YREL<span>.</span> PARTNER</div><div className="label">DRIVER WORKSPACE</div></div><div className="avatar">{partnerName.slice(0,1).toUpperCase()}</div></header>
      {tab === "Home" && <>
        <section className="intro"><div className="label">PARTNER DASHBOARD · {today.toUpperCase()}</div><h1>Hello, {partnerName.split(" ")[0]} 👋</h1><div className="muted">Ready to make today a good one?</div></section>
        <section className="status"><div><strong>{online ? "You’re online and visible" : "You’re currently offline"}</strong><small>{online ? "You can receive trip requests." : "Go online when you’re ready to drive."}</small></div><button className={"toggle "+(!online?"off":"")} onClick={()=>setOnline(!online)}>{online?"GO OFFLINE":"GO ONLINE"}</button></section>
        <div className="stats"><div className="card"><div className="stat-label">TODAY’S EARNINGS</div><div className="stat-value">₹1,840</div><div className="stat-foot">Demo figure</div></div><div className="card"><div className="stat-label">TRIPS TODAY</div><div className="stat-value">06</div><div className="stat-foot">Completed rides</div></div><div className="card"><div className="stat-label">WALLET BALANCE</div><div className="stat-value">{rupees(balance)}</div><div className="stat-foot">Wallet limit −₹200</div></div></div>
        <div className="section-head"><h2>New trip requests</h2><button className="link" onClick={()=>setTab("Requests")}>View all →</button></div>
        {!online && <p className="muted">Go online to receive real trip requests. The cards below are preview examples.</p>}
        {requests.slice(0,1).map(r=><RequestCard key={r.id} item={r} accept={accept} decline={decline}/>)}
        <div className="section-head"><h2>Quick access</h2></div><div className="rows">
          <div className="row" onClick={()=>setTab("Earnings")}><div className="icon">₹</div><div className="row-main"><b>My earnings</b><small>Daily and weekly performance</small></div>›</div>
          <div className="row" onClick={()=>setTab("Wallet")}><div className="icon">◉</div><div className="row-main"><b>Partner wallet</b><small>Balance and recharge</small></div>›</div>
        </div>
      </>}
      {tab === "Requests" && <><section className="intro"><div className="label">DISPATCH</div><h1>Trip requests</h1><div className="muted">Review the route and fare before accepting.</div></section>{requests.length?requests.map(r=><RequestCard key={r.id} item={r} accept={accept} decline={decline}/>):<div className="card empty">No sample requests remaining. Live dispatch is not connected yet.</div>}</>}
      {tab === "Trips" && <><section className="intro"><div className="label">YOUR ACTIVITY</div><h1>Trip history</h1></section><div className="rows">{[["Indiranagar → Koramangala","Today · 10:42 AM · Completed","₹340"],["Jayanagar → MG Road","Today · 8:15 AM · Completed","₹510"],["Whitefield → Marathahalli","Yesterday · Completed","₹285"]].map(x=><div className="row" key={x[0]}><div className="icon">↗</div><div className="row-main"><b>{x[0]}</b><small>{x[1]}</small></div><b>{x[2]}</b></div>)}</div></>}
      {tab === "Earnings" && <><section className="intro"><div className="label">YOUR PERFORMANCE</div><h1>Earnings</h1></section><div className="card"><div className="stat-label">THIS WEEK · DEMO</div><div className="stat-value" style={{fontSize:32}}>₹8,640</div><div className="muted">18 completed trips</div><div style={{display:"flex",height:120,alignItems:"end",gap:9,marginTop:20}}>{[42,68,52,88,60,100,73].map((v,i)=><div key={i} style={{height:v+"%",flex:1,background:"#ed792b",borderRadius:"6px 6px 0 0",opacity:.5+i*.07}}/>)}</div><div className="muted" style={{display:"flex",justifyContent:"space-between",marginTop:8}}><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div></div></>}
      {tab === "Wallet" && <><section className="intro"><div className="label">PARTNER PAYMENTS</div><h1>My wallet</h1><div className="muted">Recharge to stay eligible for new bookings.</div></section><div className="card" style={{background:"#29231d",color:"white"}}><div className="stat-label" style={{color:"#d8c8b7"}}>AVAILABLE BALANCE</div><div className="stat-value" style={{fontSize:34}}>{rupees(balance)}</div><div className="muted" style={{color:"#d8c8b7"}}>Minimum recharge ₹100 · Allowed negative balance −₹200</div></div><div className="section-head"><h2>Recharge wallet</h2></div><div className="card"><div className="muted">Select amount</div><div className="quick">{[100,200,500,1000,2000].map(v=><button className={amount===v?"selected":""} key={v} onClick={()=>setAmount(v)}>₹{v.toLocaleString("en-IN")}</button>)}</div><label className="muted">Custom amount (₹)</label><input className="field" type="number" min="100" value={amount} onChange={e=>setAmount(Number(e.target.value))}/><button className="primary" style={{width:"100%"}} onClick={recharge}>Continue to recharge</button><p className="muted">Preview only: no payment is taken. A live payment gateway is still required. Ongoing trips must never be interrupted by wallet limits.</p></div></>}
      {tab === "Profile" && <><section className="intro"><div className="label">YOUR ACCOUNT</div><h1>Partner profile</h1></section><div className="card"><label className="muted">Partner name</label><input className="field" value={partnerName} onChange={e=>setPartnerName(e.target.value)}/><label className="muted">Vehicle details</label><input className="field" value={vehicle} onChange={e=>setVehicle(e.target.value)}/><button className="primary" style={{width:"100%"}} onClick={()=>setMessage("Profile edits are preview-only until database integration.")}>Save profile</button></div><div className="section-head"><h2>Verification documents</h2></div><div className="rows">{["Driving licence","Vehicle RC","Insurance","Profile verification"].map(x=><div className="row" key={x}><div className="icon">✓</div><div className="row-main"><b>{x}</b><small>Verification status pending integration</small></div><span className="label">PENDING</span></div>)}</div></>}
      <p className="muted" style={{textAlign:"center",marginTop:25}}>YREL Partner · Development preview · Live services not connected</p>
    </div>
    <nav className="bottom"><div className="bottom-inner">{[["Home","⌂"],["Requests","⌕"],["Trips","▤"],["Earnings","₹"],["Wallet","◉"],["Profile","♙"]].map(([label,icon])=><button key={label} className={"nav "+(tab===label?"active":"")} onClick={()=>setTab(label)}><span>{icon}</span>{label}</button>)}</div></nav>
  </main>;
}

function RequestCard({item,accept,decline}:{item:RequestItem;accept:(id:string)=>void;decline:(id:string)=>void}) {
  return <article className="request"><div className="request-top"><div><div className="label">NEW REQUEST · SAMPLE</div><div className="fare">{rupees(item.fare)}</div></div><div style={{textAlign:"right"}}><b>{item.km}</b><div className="muted">{item.id}</div></div></div><div className="route"><b>{item.pickup}</b><b>{item.drop}</b></div><div className="actions"><button className="secondary" onClick={()=>decline(item.id)}>Decline</button><button className="primary" onClick={()=>accept(item.id)}>Accept trip</button></div></article>;
}
