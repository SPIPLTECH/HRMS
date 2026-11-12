import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const key = () => new TextEncoder().encode(process.env.JWT_SECRET || "");
export const COOKIE = "hr_token";

export async function signToken(email: string) {
  return new SignJWT({ email }).setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h").sign(key());
}
export async function verifyToken(t?: string) {
  if (!t) return false;
  try { await jwtVerify(t, key()); return true; } catch { return false; }
}
export async function isAuthed() {
  return verifyToken(cookies().get(COOKIE)?.value);
}
