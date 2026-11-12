import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Employee, Salary } from "@/lib/models";

const r2 = (n: number) => Math.round(n * 100) / 100;

export async function POST(req: Request) {
  await connect();
  const b = await req.json();
  const workingDays = Number(b.workingDays), holidays = Number(b.holidays) || 0;
  const absentDays = Number(b.absentDays) || 0, halfDays = Number(b.halfDays) || 0;
  const sickDays = Number(b.sickDays) || 0;
  if (!b.employeeId || !/^\d{4}-\d{2}$/.test(b.month) || !(workingDays > 0))
    return NextResponse.json({ error: "Month, employee and working days are required" }, { status: 400 });

  const emp: any = await Employee.findById(b.employeeId);
  if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

  const leaveDays = absentDays + halfDays * 0.5;
  if (sickDays < 0 || sickDays > leaveDays)
    return NextResponse.json({ error: "Sick leave days cannot exceed total leave days (absent + ½ × half days)" }, { status: 400 });
  const casualDays = leaveDays - sickDays;

  const year = Number(b.month.slice(0, 4));
  const existing: any = await Salary.findOne({ employee: emp._id, month: b.month });

  // 1) undo this month's earlier consumption (recalculation) 
  if (existing && emp.leaveYear === year) {
    emp.casualUsed = Math.max(0, emp.casualUsed - (existing.casualCovered || 0));
    emp.sickUsed = Math.max(0, emp.sickUsed - (existing.sickCovered || 0));
  }
  // 2) new leave year -> counters start fresh
  if (year > emp.leaveYear) { emp.casualUsed = 0; emp.sickUsed = 0; emp.leaveYear = year; }
  if (year < emp.leaveYear)
    return NextResponse.json({ error: `Leave counters are already on ${emp.leaveYear}; can't calculate for ${year}` }, { status: 400 });

  // 3) adjust against remaining balance, store consumption
  const casualBal = Math.max(0, emp.casualAllotted - emp.casualUsed);
  const sickBal = Math.max(0, emp.sickAllotted - emp.sickUsed);
  const casualCovered = Math.min(casualBal, casualDays);
  const sickCovered = Math.min(sickBal, sickDays);
  const unpaidDays = (casualDays - casualCovered) + (sickDays - sickCovered);
  emp.casualUsed += casualCovered;
  emp.sickUsed += sickCovered;

  // 4) salary + TDS
  const perDay = emp.monthlySalary / (workingDays + holidays);
  const deduction = unpaidDays * perDay;
  const grossAfterLeave = emp.monthlySalary - deduction;
  const tdsPercent = b.tdsPercent === "" || b.tdsPercent == null ? emp.tdsPercent : Number(b.tdsPercent);
  const tds = grossAfterLeave * tdsPercent / 100;

  await emp.save();
  const saved = await Salary.findOneAndUpdate({ employee: emp._id, month: b.month }, {
    employee: emp._id, empId: emp.empId, name: emp.name, bankAccount: emp.bankAccount, ifsc: emp.ifsc,
    month: b.month, monthlySalary: emp.monthlySalary, workingDays, holidays, absentDays, halfDays, leaveDays,
    casualDays, sickDays, casualCovered, sickCovered, unpaidDays, perDay: r2(perDay), deduction: r2(deduction),
    grossAfterLeave: r2(grossAfterLeave), tdsPercent, tds: r2(tds), netSalary: r2(grossAfterLeave - tds),
  }, { upsert: true, new: true, setDefaultsOnInsert: true });

  return NextResponse.json({ salary: saved, balances: {
    casualLeft: emp.casualAllotted - emp.casualUsed, sickLeft: emp.sickAllotted - emp.sickUsed } });
}
export async function GET(req: Request) {
  await connect();
  const month = new URL(req.url).searchParams.get("month");
  return NextResponse.json(await Salary.find(month ? { month } : {}).sort({ month: -1, name: 1 }).lean());
}
