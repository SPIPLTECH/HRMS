"use client";
import { useEffect, useState } from "react";

const empty = { empId: "", name: "", bankAccount: "", ifsc: "", monthlySalary: "", tdsPercent: "0", casualAllotted: "8", sickAllotted: "8" };
export default function Employees() {
  const [list, setList] = useState<any[]>([]);
  const [f, setF] = useState(empty);
  const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null);
  const load = () => fetch("/api/employees").then(r => r.json()).then(setList);
  useEffect(() => { load(); }, []);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await r.json();
    if (r.ok) { setMsg({ t: "Employee added", ok: true }); setF(empty); load(); } else setMsg({ t: d.error, ok: false });
  }
  async function del(id: string) {
    if (!confirm("Delete this employee? Past salary history is kept.")) return;
    await fetch(`/api/employees/${id}`, { method: "DELETE" }); load();
  }
  async function edit(e: any) {
    const c = prompt("Casual leaves allotted", e.casualAllotted); if (c === null) return;
    const s = prompt("Sick leaves allotted", e.sickAllotted); if (s === null) return;
    const t = prompt("TDS %", e.tdsPercent); if (t === null) return;
    const m = prompt("Monthly salary", e.monthlySalary); if (m === null) return;
    await fetch(`/api/employees/${e._id}`, { method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ casualAllotted: c, sickAllotted: s, tdsPercent: t, monthlySalary: m }) });
    load();
  }
  return (<>
    <h1>Add Employee</h1><p className="sub">Create and manage employees, leave allotment and TDS</p>
    <form className="card" onSubmit={add}>
      <div className="form">
        <div><label>Employee ID</label><input required value={f.empId} onChange={set("empId")} /></div>
        <div><label>Employee Name</label><input required value={f.name} onChange={set("name")} /></div>
        <div><label>Bank Account Number</label><input required value={f.bankAccount} onChange={set("bankAccount")} /></div>
        <div><label>IFSC Code</label><input required value={f.ifsc} onChange={set("ifsc")} /></div>
        <div><label>Salary per month (₹)</label><input required type="number" min="0" value={f.monthlySalary} onChange={set("monthlySalary")} /></div>
        <div><label>TDS (% of gross)</label><input type="number" min="0" max="100" step="0.01" value={f.tdsPercent} onChange={set("tdsPercent")} /></div>
        <div><label>Casual leaves allotted (per year)</label><input type="number" min="0" step="0.5" value={f.casualAllotted} onChange={set("casualAllotted")} /></div>
        <div><label>Sick leaves allotted (per year)</label><input type="number" min="0" step="0.5" value={f.sickAllotted} onChange={set("sickAllotted")} /></div>
      </div>
      {msg && <div className={"msg " + (msg.ok ? "good" : "err")}>{msg.t}</div>}
      <button className="btn" style={{ marginTop: 16 }}>Add Employee</button>
    </form>
    <div className="card scroll" style={{ marginTop: 24 }}>
      <table><thead><tr><th>Emp ID</th><th>Name</th><th>Bank A/c</th><th>IFSC</th><th>Salary</th><th>TDS</th><th>Casual used</th><th>Sick used</th><th></th></tr></thead>
        <tbody>{list.map(e => <tr key={e._id}><td>{e.empId}</td><td>{e.name}</td><td>{e.bankAccount}</td><td>{e.ifsc}</td>
          <td>₹{e.monthlySalary.toLocaleString("en-IN")}</td><td>{e.tdsPercent}%</td>
          <td><span className="badge">{e.casualUsed} / {e.casualAllotted}</span></td><td><span className="badge">{e.sickUsed} / {e.sickAllotted}</span></td>
          <td style={{ whiteSpace: "nowrap" }}><button className="btn sm" style={{ background: "var(--brand)", marginRight: 6 }} onClick={() => edit(e)}>Edit</button><button className="btn sm" onClick={() => del(e._id)}>Delete</button></td></tr>)}
          {!list.length && <tr><td colSpan={9}>No employees yet.</td></tr>}</tbody></table>
    </div>
  </>);
}
