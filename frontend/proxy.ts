import { NextRequest, NextResponse } from "next/server"
import { isProtectedPath } from "./constants/routes"

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  const accessCookie = req.cookies.get("access_token")?.value
  if (accessCookie && accessCookie.length > 0) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/login", req.nextUrl.origin)
  loginUrl.searchParams.set("from", pathname + (search || ""))

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/generate-by-text/:path*",
    "/generate-by-pdf/:path*",
    "/generate-by-audio/:path*",
    "/generate-by-youtube/:path*",
    "/account/:path*",
    "/profile/:path*",
    "/quizzes/:path*",
    "/quiz/:path*",
  ],
}
