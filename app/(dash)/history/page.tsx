"use client";
import { useEffect, useMemo, useState } from "react";

const inr = (n: number) => "₹" + (n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
export default function History() {
  const [rows, setRows] = useState<any[]>([]);
  const [month, setMonth] = useState("");
  useEffect(() => { fetch("/api/salary").then(r => r.json()).then(setRows); }, []);
  const groups = useMemo(() => {
    const g: Record<string, any[]> = {};
    rows.filter(r => !month || r.month === month).forEach(r => (g[r.month] ||= []).push(r));
    return Object.entries(g);
  }, [rows, month]);
  return (<>
    <h1>Salary History</h1><p className="sub">Month-wise records</p>
    <div className="row" style={{ marginBottom: 20 }}>
      <div><label>Filter by month</label><input type="month" value={month} onChange={e => setMonth(e.target.value)} /></div>
      {month && <button className="btn" onClick={() => setMonth("")}>Clear</button>}
    </div>
    {groups.map(([m, list]) => (
      <div className="card scroll" key={m} style={{ marginBottom: 20 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>{m} · Total {inr(list.reduce((s, r) => s + r.netSalary, 0))}</h3>
          <a className="btn" href={`/api/export?month=${m}`}>⬇ CSV</a>
        </div>
        <table><thead><tr><th>Emp ID</th><th>Name</th><th>Salary</th><th>Work</th><th>Hol.</th><th>Abs</th><th>Half</th><th>Casual</th><th>Sick</th><th>Unpaid</th><th>Leave ded.</th><th>TDS</th><th>Net</th></tr></thead>
          <tbody>{list.map(r => <tr key={r._id}><td>{r.empId}</td><td>{r.name}</td><td>{inr(r.monthlySalary)}</td><td>{r.workingDays}</td><td>{r.holidays}</td>
            <td>{r.absentDays}</td><td>{r.halfDays}</td><td>{r.casualCovered}</td><td>{r.sickCovered}</td><td>{r.unpaidDays}</td><td>{inr(r.deduction)}</td><td>{inr(r.tds)}</td><td><b>{inr(r.netSalary)}</b></td></tr>)}</tbody></table>
      </div>))}
    {!groups.length && <div className="card">No records yet.</div>}
  </>);
}
