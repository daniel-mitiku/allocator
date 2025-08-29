import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Super admin routes
    if (pathname.startsWith("/super-admin")) {
      if (token?.systemRole !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    // College admin routes
    if (pathname.startsWith("/admin")) {
      if (!token?.systemRole || token.systemRole === "PERSONNEL") {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow access to auth pages
        if (pathname.startsWith("/auth")) {
          return true
        }

        // Require authentication for protected routes
        if (pathname.startsWith("/admin") || pathname.startsWith("/super-admin")) {
          return !!token
        }

        return true
      },
    },
  },
)

export const config = {
  matcher: ["/admin/:path*", "/super-admin/:path*", "/auth/:path*"],
}
