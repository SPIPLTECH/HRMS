import { Salary, YEARLY_LEAVES } from "./models";

/** Leaves already used by an employee in a year, optionally ignoring one month (recalculation). */
export async function leavesUsed(employee: string, year: string, exceptMonth?: string) {
  const rows = await Salary.find({ employee, month: { $regex: `^${year}-` } });
  return rows.filter((r: any) => r.month !== exceptMonth)
    .reduce((s: number, r: any) => s + (r.leavesCovered || 0), 0);
}
export async function leaveBalance(employee: string, year: string, exceptMonth?: string) {
  return Math.max(0, YEARLY_LEAVES - (await leavesUsed(employee, year, exceptMonth)));
}
