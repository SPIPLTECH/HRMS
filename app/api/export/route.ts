import { connect } from "@/lib/db";
import { Salary } from "@/lib/models";

export async function GET(req: Request) {
  await connect();
  let month = new URL(req.url).searchParams.get("month");
  if (!month) {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1);
    month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  const rows: any[] = await Salary.find({ month }).sort({ name: 1 }).lean();
  const head = ["Month","Emp ID","Name","Bank Account","IFSC","Monthly Salary","Working Days","Holidays","Absent","Half Days",
    "Leave Days","Casual Used","Sick Used","Unpaid Days","Per Day","Leave Deduction","TDS %","TDS","Net Salary"];
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map(r => [r.month,r.empId,r.name,r.bankAccount,r.ifsc,r.monthlySalary,r.workingDays,r.holidays,r.absentDays,
    r.halfDays,r.leaveDays,r.casualCovered,r.sickCovered,r.unpaidDays,r.perDay,r.deduction,r.tdsPercent,r.tds,r.netSalary].map(esc).join(","));
  return new Response([head.map(esc).join(","), ...lines].join("\n"), {
    headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="salary-${month}.csv"` },
  });
}
