import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isApiAdminPath = req.nextUrl.pathname.startsWith("/api/admin");
  const isAdminPath = req.nextUrl.pathname.startsWith("/admin");
  if (!isApiAdminPath && !isAdminPath) {
    return NextResponse.next();
  }

  if (!req.auth?.user) {
    if (isApiAdminPath) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
