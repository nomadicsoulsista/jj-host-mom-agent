import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, SESSION_COOKIE, isValidAdmin, isValidSession } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/login") || pathname.startsWith("/api/login") || pathname.startsWith("/_next") || pathname === "/logo.webp" || pathname === "/favicon.ico") {
    return NextResponse.next();
  }
  const member = await isValidSession(request.cookies.get(SESSION_COOKIE)?.value);
  const admin = await isValidAdmin(request.cookies.get(ADMIN_COOKIE)?.value);

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (admin) return NextResponse.next();
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "admin required" }, { status: 401 });
    return NextResponse.redirect(new URL("/login?admin=1", request.url));
  }
  if (member || admin) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "login required" }, { status: 401 });
  const url = new URL("/login", request.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
