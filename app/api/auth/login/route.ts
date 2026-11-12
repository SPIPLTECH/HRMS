import { NextResponse } from "next/server";
import { signToken, COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (email?.trim().toLowerCase() !== process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
      password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await signToken(email), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 8 * 3600,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
