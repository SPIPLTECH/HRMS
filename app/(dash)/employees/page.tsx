"use client";
import { useEffect, useState } from "react";

export default function Employees() {
  const [list, setList] = useState<any[]>([]);
  const [f, setF] = useState({ name: "", empId: "", monthlySalary: "" });
  const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null);
  const load = () => fetch("/api/employees").then(r => r.json()).then(setList);
  useEffect(() => { load(); }, []);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await r.json();
    if (r.ok) { setMsg({ t: "Employee added", ok: true }); setF({ name: "", empId: "", monthlySalary: "" }); load(); }
    else setMsg({ t: d.error, ok: false });
  }
  async function del(id: string) {
    if (!confirm("Delete this employee? Past salary history is kept.")) return;
    await fetch(`/api/employees/${id}`, { method: "DELETE" }); load();
  }
  return (<>
    <h1>Add Employee</h1><p className="sub">Create and manage employees</p>
    <form className="card" onSubmit={add}>
      <div className="form">
        <div><label>Employee Name</label><input required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
        <div><label>Employee ID</label><input required value={f.empId} onChange={e => setF({ ...f, empId: e.target.value })} /></div>
        <div><label>Monthly Salary (₹)</label><input required type="number" min="0" value={f.monthlySalary} onChange={e => setF({ ...f, monthlySalary: e.target.value })} /></div>
      </div>
      {msg && <div className={"msg " + (msg.ok ? "good" : "err")}>{msg.t}</div>}
      <button className="btn" style={{ marginTop: 16 }}>Add Employee</button>
    </form>
    <div className="card scroll" style={{ marginTop: 24 }}>
      <table><thead><tr><th>Emp ID</th><th>Name</th><th>Monthly Salary</th><th>Leave balance ({new Date().getFullYear()})</th><th></th></tr></thead>
        <tbody>{list.map(e => <tr key={e._id}><td>{e.empId}</td><td>{e.name}</td><td>₹{e.monthlySalary.toLocaleString("en-IN")}</td>
          <td><span className="badge">{e.leaveBalance} / 8</span></td><td><button className="btn sm" onClick={() => del(e._id)}>Delete</button></td></tr>)}
          {!list.length && <tr><td colSpan={5}>No employees yet.</td></tr>}</tbody></table>
    </div>
  </>);
}
