"use client";
import { useEffect, useState } from "react";

const now = new Date();
const defMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
export default function Calculate() {
  const [emps, setEmps] = useState<any[]>([]);
  const [f, setF] = useState({ month: defMonth, employeeId: "", workingDays: "", absentDays: "0", halfDays: "0", holidays: "0" });
  const [res, setRes] = useState<any>(null), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { fetch(`/api/employees?year=${f.month.slice(0, 4)}`).then(r => r.json()).then(setEmps); }, [f.month.slice(0, 4)]);
  const emp = emps.find(e => e._id === f.employeeId);
  async function calc(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setRes(null); setBusy(true);
    const r = await fetch("/api/salary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await r.json(); setBusy(false);
    r.ok ? setRes(d) : setErr(d.error);
  }
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  return (<>
    <h1>Calculate Salary</h1><p className="sub">Each employee gets 8 leaves per year. Absences are adjusted from this balance; the excess is deducted.</p>
    <form className="card" onSubmit={calc}>
      <div className="form">
        <div><label>Month</label><input type="month" required value={f.month} onChange={set("month")} /></div>
        <div><label>Employee</label><select required value={f.employeeId} onChange={set("employeeId")}>
          <option value="">Select employee…</option>{emps.map(e => <option key={e._id} value={e._id}>{e.name} ({e.empId})</option>)}</select></div>
        <div><label>Total working days</label><input type="number" min="1" required value={f.workingDays} onChange={set("workingDays")} /></div>
        <div><label>Total holidays</label><input type="number" min="0" value={f.holidays} onChange={set("holidays")} /></div>
        <div><label>Absent days</label><input type="number" min="0" step="1" value={f.absentDays} onChange={set("absentDays")} /></div>
        <div><label>Half days</label><input type="number" min="0" step="1" value={f.halfDays} onChange={set("halfDays")} /></div>
      </div>
      {emp && <p className="sub" style={{ marginTop: 16 }}>Monthly salary: <b>{inr(emp.monthlySalary)}</b> · Leave balance for {f.month.slice(0, 4)}: <b>{emp.leaveBalance}</b> of 8</p>}
      {err && <div className="msg err">{err}</div>}
      <button className="btn" disabled={busy} style={{ marginTop: 8 }}>{busy ? "Calculating…" : "Calculate & Save"}</button>
    </form>
    {res && <div className="card" style={{ marginTop: 24 }}>
      <h3 style={{ margin: 0 }}>{res.name} ({res.empId}) – {res.month}</h3>
      <div className="result">
        <div>Gross salary<b>{inr(res.monthlySalary)}</b></div>
        <div>Leave days taken<b>{res.leaveDays}</b></div>
        <div>Adjusted from balance<b>{res.leavesCovered}</b></div>
        <div>Unpaid days<b>{res.unpaidDays}</b></div>
        <div>Per-day rate<b>{inr(res.perDay)}</b></div>
        <div>Deduction<b>{inr(res.deduction)}</b></div>
        <div style={{ background: "#dcfce7", color: "#166534" }}>Net salary<b>{inr(res.netSalary)}</b></div>
      </div>
      <p className="sub" style={{ marginTop: 12 }}>Saved to history. Recalculating the same employee/month overwrites the record.</p>
    </div>}
  </>);
}
