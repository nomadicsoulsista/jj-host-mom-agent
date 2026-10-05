import { NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_COOKIE, adminToken, sessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { password, admin } = (await req.json()) as { password?: string; admin?: boolean };
  if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });

  const res = NextResponse.json({ ok: true });
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  };

  if (admin) {
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Incorrect admin password" }, { status: 401 });
    }
    res.cookies.set(ADMIN_COOKIE, await adminToken(), cookieOpts);
    return res;
  }
  if (!process.env.CHAPTER_PASSWORD || password !== process.env.CHAPTER_PASSWORD) {
    return NextResponse.json({ error: "Incorrect chapter password" }, { status: 401 });
  }
  res.cookies.set(SESSION_COOKIE, await sessionToken(), cookieOpts);
  return res;
}
