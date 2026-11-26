"use client";
import { useEffect, useState } from "react";

type ProfileData = { full_name?: string; email?: string; phone?: string; preferred_language?: string };
export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>({ preferred_language: "en" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/profile").then(async (response) => {
      const data = await response.json();
      if (response.ok && data.profile) setProfile({
        full_name: data.profile.full_name ?? "",
        email: data.profile.email ?? "",
        phone: data.profile.phone ?? "",
        preferred_language: data.profile.preferred_language ?? "en",
      });
      else if (!response.ok) setMessage(data.error ?? "Sign in to edit your profile.");
    }).catch(() => setMessage("Could not load your profile.")).finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Profile save failed.");
      setMessage("Your profile has been saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile save failed.");
    } finally { setSaving(false); }
  }

  return <main className="shell">
    <header className="topbar"><a className="brand" href="/">YREL<span>.</span></a><span className="tag">PROFILE</span></header>
    <section className="auth-wrap">
      <h1>Your profile</h1><p className="muted">Keep your contact details and language preference up to date.</p>
      <div className="panel">
        <label className="field"><span>FULL NAME</span><input value={profile.full_name ?? ""} onChange={e=>setProfile(p=>({...p,full_name:e.target.value}))} placeholder="Your name"/></label>
        <label className="field"><span>EMAIL</span><input type="email" value={profile.email ?? ""} onChange={e=>setProfile(p=>({...p,email:e.target.value}))} placeholder="you@example.com"/></label>
        <label className="field"><span>MOBILE NUMBER</span><input inputMode="tel" maxLength={14} value={profile.phone ?? ""} onChange={e=>setProfile(p=>({...p,phone:e.target.value.replace(/[^0-9+]/g,"")}))} placeholder="+91 9876543210"/></label>
        <label className="field"><span>LANGUAGE</span><select value={profile.preferred_language ?? "en"} onChange={e=>setProfile(p=>({...p,preferred_language:e.target.value}))}><option value="en">English</option><option value="kn">ಕನ್ನಡ</option><option value="hi">हिन्दी</option></select></label>
        <button className="primary" disabled={loading || saving} onClick={save}>{loading ? "Loading…" : saving ? "Saving…" : "Save profile"}</button>
        {message && <p className="notice" style={{marginTop:12}}>{message}</p>}
      </div>
    </section>
  </main>;
}
