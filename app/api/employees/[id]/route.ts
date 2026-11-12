import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Employee } from "@/lib/models";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connect();
  await Employee.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
