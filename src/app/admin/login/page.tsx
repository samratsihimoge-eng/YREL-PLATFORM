import Link from "next/link";
export default function AdminLoginPage() {
  return <main className="shell"><header className="topbar"><Link href="/" className="brand">YREL<span>.</span></Link><span className="tag">Admin access</span></header><section className="auth-wrap"><h1>Private administrator sign-in</h1><p className="muted">Admin accounts are provisioned by the platform owner. Public admin registration is disabled.</p><p className="notice">Sign in using the authorized Appwrite admin session. This page does not create accounts or bypass role checks.</p><Link className="secondary" href="/">Back to customer app</Link></section></main>;
}
