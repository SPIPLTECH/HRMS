import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Employee } from "@/lib/models";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connect();
  await Employee.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
// Edit allotments / salary / TDS / bank details
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connect();
  const b = await req.json();
  const allowed = ["name", "bankAccount", "ifsc", "monthlySalary", "tdsPercent", "casualAllotted", "sickAllotted"];
  const set: any = {};
  for (const k of allowed) if (b[k] !== undefined && b[k] !== "") set[k] = ["name", "bankAccount", "ifsc"].includes(k) ? b[k] : Number(b[k]);
  const e = await Employee.findByIdAndUpdate(params.id, set, { new: true });
  return NextResponse.json(e);
}
