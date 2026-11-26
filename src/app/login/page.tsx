"use client";
import { useState } from "react";
export default function LoginPage() {
  const [phone,setPhone]=useState(""); const [otp,setOtp]=useState(""); const [sent,setSent]=useState(false);
  const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [note,setNote]=useState("");
  async function send() {
    setBusy(true); setError(""); setNote("");
    try { const r=await fetch("/api/auth/send-otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone})}); const d=await r.json(); if(!r.ok) throw new Error(d.error||"Could not send OTP."); setSent(true); setNote("OTP sent. It expires in 5 minutes."); }
    catch(e){setError(e instanceof Error?e.message:"Could not send OTP.");} finally{setBusy(false);}
  }
  async function verify() {
    setBusy(true); setError("");
    try { const r=await fetch("/api/auth/verify-otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,otp})}); const d=await r.json(); if(!r.ok) throw new Error(d.error||"Verification failed."); window.location.assign(d.redirectTo||"/"); }
    catch(e){setError(e instanceof Error?e.message:"Verification failed.");} finally{setBusy(false);}
  }
  return <main className="shell"><header className="topbar"><a href="/" className="brand">YREL<span>.</span></a><span className="tag">CUSTOMER LOGIN</span></header><section className="auth-wrap"><span className="eyebrow" style={{color:"#c16c2d"}}>WELCOME TO YREL</span><h1>Continue with your phone</h1><p className="muted">Sign in securely with a one-time password.</p><div className="panel"><label className="field"><span>MOBILE NUMBER</span><div style={{display:"flex",gap:8,alignItems:"center"}}><b style={{padding:12,background:"#fff4e8",borderRadius:12}}>+91</b><input inputMode="numeric" maxLength={10} value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit mobile number" disabled={sent}/></div></label>{sent&&<label className="field"><span>6-DIGIT OTP</span><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="Enter OTP"/></label>}{error&&<p className="notice">{error}</p>}{note&&<p className="notice">{note}</p>}{!sent?<button className="primary" disabled={busy||phone.length!==10} onClick={send}>{busy?"Sending…":"Send OTP"}</button>:<><button className="primary" disabled={busy||otp.length!==6} onClick={verify}>{busy?"Verifying…":"Verify & continue"}</button><button className="secondary" style={{marginTop:10,width:"100%"}} disabled={busy} onClick={()=>{setSent(false);setOtp("");setNote("");setError("");}}>Change number</button></>}</div><p className="subtle" style={{marginTop:16}}>Customer access only. Driver and administrator access are separate.</p></section></main>;
}
