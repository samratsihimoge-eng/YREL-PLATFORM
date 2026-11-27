"use client";
import { useState } from "react";
export default function LoginPage() {
  const [phone,setPhone]=useState(""); const [passcode,setPasscode]=useState("");
  const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  async function signIn() {
    setBusy(true); setError("");
    try {
      const r=await fetch("/api/auth/verify-passcode",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,passcode,role:"customer"})});
      const d=await r.json(); if(!r.ok) throw new Error(d.error||"Sign-in failed.");
      window.location.assign(d.redirectTo||"/");
    } catch(e) { setError(e instanceof Error?e.message:"Sign-in failed."); }
    finally { setBusy(false); }
  }
  return <main className="shell"><header className="topbar"><a href="/" className="brand">YREL<span>.</span></a><span className="tag">CUSTOMER LOGIN</span></header><section className="auth-wrap"><span className="eyebrow" style={{color:"#a17d9f"}}>WELCOME TO YREL</span><h1>Good to have you back.</h1><p className="muted">Sign in securely with your registered mobile number and six-digit passcode.</p><div className="panel"><label className="field"><span>MOBILE NUMBER</span><div style={{display:"flex",gap:8,alignItems:"center"}}><b style={{padding:12,background:"#f2edf4",borderRadius:12,color:"#493650"}}>+91</b><input inputMode="numeric" autoComplete="tel-national" maxLength={10} value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit mobile number"/></div></label><label className="field"><span>6-DIGIT PASSCODE</span><input inputMode="numeric" autoComplete="current-password" maxLength={6} value={passcode} onChange={e=>setPasscode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="Enter passcode" type="password"/></label>{error&&<p className="notice">{error}</p>}<button className="primary" disabled={busy||phone.length!==10||passcode.length!==6} onClick={signIn}>{busy?"Signing in…":"Continue securely"}</button></div><p className="subtle" style={{marginTop:16}}>Customer access only. Driver and administrator access are separate.</p></section></main>;
}
