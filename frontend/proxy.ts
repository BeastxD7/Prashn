import { NextRequest, NextResponse } from "next/server"
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // With all routes public, simply allow every request to continue.
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
