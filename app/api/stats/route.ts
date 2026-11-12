import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Employee, Salary } from "@/lib/models";

export async function GET() {
  await connect();
  const d = new Date();
  const ym = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`;
  const cur = ym(d), last = ym(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const total = async (m: string) => {
    const rows: any[] = await Salary.find({ month: m }).lean();
    return { count: rows.length, payout: rows.reduce((s, r) => s + r.netSalary, 0),
      deductions: rows.reduce((s, r) => s + r.deduction, 0) };
  };
  return NextResponse.json({
    employees: await Employee.countDocuments(),
    currentMonth: cur, lastMonth: last,
    current: await total(cur), last: await total(last),
  });
}
