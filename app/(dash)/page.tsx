"use client";
import { useEffect, useState } from "react";

const inr = (n: number) => "₹" + (n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
export default function Home() {
  const [s, setS] = useState<any>(null);
  useEffect(() => { fetch("/api/stats").then(r => r.json()).then(setS); }, []);
  if (!s) return <p>Loading…</p>;
  return (<>
    <h1>Dashboard</h1><p className="sub">Overview of your payroll</p>
    <div className="grid">
      <div className="card stat"><div className="k">Total Employees</div><div className="v">{s.employees}</div></div>
      <div className="card stat"><div className="k">Last Month Payout ({s.lastMonth})</div><div className="v">{inr(s.last.payout)}</div></div>
      <div className="card stat"><div className="k">Last Month Deductions</div><div className="v">{inr(s.last.deductions)}</div></div>
      <div className="card stat"><div className="k">Salaries Processed ({s.currentMonth})</div><div className="v">{s.current.count}/{s.employees}</div></div>
    </div>
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Quick actions</h3>
      <div className="row">
        <a className="btn" href={`/api/export?month=${s.lastMonth}`}>⬇ Download last month salary data (CSV)</a>
        <a className="btn" href="/calculate">Calculate salary</a>
        <a className="btn" href="/employees">Add employee</a>
      </div>
    </div>
  </>);
}
