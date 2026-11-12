"use client";
import { useEffect, useState } from "react";

const now = new Date();
const defMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
const inr = (n: number) => "₹" + (n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
export default function Calculate() {
  const [emps, setEmps] = useState<any[]>([]);
  const [f, setF] = useState({ month: defMonth, employeeId: "", workingDays: "", holidays: "0", absentDays: "0", halfDays: "0", sickDays: "0", tdsPercent: "" });
  const [res, setRes] = useState<any>(null), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const load = () => fetch("/api/employees").then(r => r.json()).then(setEmps);
  useEffect(() => { load(); }, []);
  const emp = emps.find(e => e._id === f.employeeId);
  const leaveTotal = (Number(f.absentDays) || 0) + (Number(f.halfDays) || 0) * 0.5;
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  function pick(e: any) { const x = emps.find(a => a._id === e.target.value); setF({ ...f, employeeId: e.target.value, tdsPercent: x ? String(x.tdsPercent) : "" }); }
  async function calc(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setRes(null); setBusy(true);
    const r = await fetch("/api/salary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await r.json(); setBusy(false);
    if (r.ok) { setRes(d); load(); } else setErr(d.error);
  }
  return (<>
    <h1>Calculate Salary</h1><p className="sub">Leaves are adjusted against each employee's stored casual and sick balance. Consumption is saved automatically.</p>
    <form className="card" onSubmit={calc}>
      <div className="form">
        <div><label>Month</label><input type="month" required value={f.month} onChange={set("month")} /></div>
        <div><label>Employee</label><select required value={f.employeeId} onChange={pick}>
          <option value="">Select employee…</option>{emps.map(e => <option key={e._id} value={e._id}>{e.name} ({e.empId})</option>)}</select></div>
        <div><label>Total working days</label><input type="number" min="1" required value={f.workingDays} onChange={set("workingDays")} /></div>
        <div><label>Total holidays</label><input type="number" min="0" value={f.holidays} onChange={set("holidays")} /></div>
        <div><label>Absent days</label><input type="number" min="0" value={f.absentDays} onChange={set("absentDays")} /></div>
        <div><label>Half days</label><input type="number" min="0" value={f.halfDays} onChange={set("halfDays")} /></div>
        <div><label>Of the leave days, how many are Sick (rest = Casual)</label><input type="number" min="0" step="0.5" max={leaveTotal} value={f.sickDays} onChange={set("sickDays")} /></div>
        <div><label>TDS % (default from employee)</label><input type="number" min="0" max="100" step="0.01" value={f.tdsPercent} onChange={set("tdsPercent")} /></div>
      </div>
      {emp && <p className="sub" style={{ marginTop: 16 }}>Salary <b>{inr(emp.monthlySalary)}</b> · Casual left <b>{emp.casualAllotted - emp.casualUsed}</b>/{emp.casualAllotted} · Sick left <b>{emp.sickAllotted - emp.sickUsed}</b>/{emp.sickAllotted} · Total leave days this month: <b>{leaveTotal}</b></p>}
      {err && <div className="msg err">{err}</div>}
      <button className="btn" disabled={busy} style={{ marginTop: 8 }}>{busy ? "Calculating…" : "Calculate & Save"}</button>
    </form>
    {res && (() => { const s = res.salary; return <div className="card" style={{ marginTop: 24 }}>
      <h3 style={{ margin: 0 }}>{s.name} ({s.empId}) – {s.month}</h3>
      <div className="result">
        <div>Gross salary<b>{inr(s.monthlySalary)}</b></div>
        <div>Casual used<b>{s.casualCovered}</b></div>
        <div>Sick used<b>{s.sickCovered}</b></div>
        <div>Unpaid days<b>{s.unpaidDays}</b></div>
        <div>Leave deduction<b>{inr(s.deduction)}</b></div>
        <div>TDS ({s.tdsPercent}%)<b>{inr(s.tds)}</b></div>
        <div style={{ background: "#dcfce7", color: "#166534" }}>Net salary<b>{inr(s.netSalary)}</b></div>
      </div>
      <p className="sub" style={{ marginTop: 12 }}>Remaining balance → Casual: {res.balances.casualLeft}, Sick: {res.balances.sickLeft}. Saved to history.</p>
    </div>; })()}
  </>);
}
