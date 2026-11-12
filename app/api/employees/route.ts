import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Employee } from "@/lib/models";

export async function GET() {
  await connect();
  const list: any[] = await Employee.find().sort({ name: 1 }).lean();
  const yr = new Date().getFullYear();
  // counters from a previous leave year show as fresh for the current year
  return NextResponse.json(list.map(e => e.leaveYear < yr ? { ...e, casualUsed: 0, sickUsed: 0, leaveYear: yr } : e));
}
export async function POST(req: Request) {
  await connect();
  const b = await req.json();
  const n = (v: any, d = 0) => (v === "" || v == null ? d : Number(v));
  if (!b.empId || !b.name || !b.bankAccount || !b.ifsc || !(n(b.monthlySalary, -1) >= 0))
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  try {
    const e = await Employee.create({
      empId: b.empId, name: b.name, bankAccount: b.bankAccount, ifsc: b.ifsc,
      monthlySalary: n(b.monthlySalary), tdsPercent: n(b.tdsPercent),
      casualAllotted: n(b.casualAllotted, 8), sickAllotted: n(b.sickAllotted, 8),
    });
    return NextResponse.json(e, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.code === 11000 ? "Employee ID already exists" : err.message }, { status: 400 });
  }
}
