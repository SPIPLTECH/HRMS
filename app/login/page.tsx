"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (r.ok) location.href = "/"; else { setErr((await r.json()).error); setBusy(false); }
  }
  return (
    <div className="loginbox"><div className="card">
      <h1>💼 HR Salary Portal</h1><p className="sub">Sign in to continue</p>
      <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
        <div><label>Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div><label>Password</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} /></div>
        {err && <div className="msg err">{err}</div>}
        <button className="btn" disabled={busy}>{busy ? "Signing in…" : "Login"}</button>
      </form>
    </div></div>
  );
}
