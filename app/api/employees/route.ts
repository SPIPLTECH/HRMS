import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Employee } from "@/lib/models";
import { leaveBalance } from "@/lib/leave";

export async function GET(req: Request) {
  await connect();
  const year = new URL(req.url).searchParams.get("year") || String(new Date().getFullYear());
  const list = await Employee.find().sort({ name: 1 }).lean();
  const out = await Promise.all(list.map(async (e: any) => ({
    ...e, _id: String(e._id), leaveBalance: await leaveBalance(String(e._id), year),
  })));
  return NextResponse.json(out);
}
export async function POST(req: Request) {
  await connect();
  const { empId, name, monthlySalary } = await req.json();
  if (!empId || !name || !(Number(monthlySalary) >= 0))
    return NextResponse.json({ error: "Name, Employee ID and salary are required" }, { status: 400 });
  try {
    const e = await Employee.create({ empId, name, monthlySalary: Number(monthlySalary) });
    return NextResponse.json(e, { status: 201 });
  } catch (err: any) {
    const msg = err.code === 11000 ? "Employee ID already exists" : err.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
