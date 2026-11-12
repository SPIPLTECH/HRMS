import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Employee, Salary } from "@/lib/models";
import { leaveBalance } from "@/lib/leave";

const r2 = (n: number) => Math.round(n * 100) / 100;

export async function POST(req: Request) {
  await connect();
  const b = await req.json();
  const workingDays = Number(b.workingDays), holidays = Number(b.holidays) || 0;
  const absentDays = Number(b.absentDays) || 0, halfDays = Number(b.halfDays) || 0;
  if (!b.employeeId || !/^\d{4}-\d{2}$/.test(b.month) || !(workingDays > 0))
    return NextResponse.json({ error: "Month, employee and working days are required" }, { status: 400 });

  const emp: any = await Employee.findById(b.employeeId);
  if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

  const leaveDays = absentDays + halfDays * 0.5;
  const balance = await leaveBalance(String(emp._id), b.month.slice(0, 4), b.month);
  const leavesCovered = Math.min(balance, leaveDays);
  const unpaidDays = leaveDays - leavesCovered;
  const perDay = emp.monthlySalary / (workingDays + holidays); // holidays are paid
  const deduction = unpaidDays * perDay;
  const doc = {
    employee: emp._id, empId: emp.empId, name: emp.name, month: b.month,
    monthlySalary: emp.monthlySalary, workingDays, holidays, absentDays, halfDays,
    leaveDays, leavesCovered, unpaidDays, perDay: r2(perDay),
    deduction: r2(deduction), netSalary: r2(emp.monthlySalary - deduction),
  };
  const saved = await Salary.findOneAndUpdate({ employee: emp._id, month: b.month }, doc,
    { upsert: true, new: true, setDefaultsOnInsert: true });
  return NextResponse.json(saved);
}
export async function GET(req: Request) {
  await connect();
  const month = new URL(req.url).searchParams.get("month");
  const rows = await Salary.find(month ? { month } : {}).sort({ month: -1, name: 1 }).lean();
  return NextResponse.json(rows);
}
