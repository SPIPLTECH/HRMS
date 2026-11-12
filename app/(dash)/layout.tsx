"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [["/", "Home"], ["/calculate", "Calculate Salary"], ["/employees", "Add Employee"], ["/history", "History"]];
export default function Dash({ children }: { children: React.ReactNode }) {
  const p = usePathname();
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/login"; }
  return (<>
    <header className="top">
      <div className="logo">💼 HR Salary Portal</div>
      <nav className="tabs">{tabs.map(([h, l]) => <Link key={h} href={h} className={"tab" + (p === h ? " on" : "")}>{l}</Link>)}</nav>
      <button className="btn ghost" onClick={logout}>Logout</button>
    </header>
    <main className="wrap">{children}</main>
  </>);
}
