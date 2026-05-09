import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ADMIN_ROLES, POS_ROLES, STAFF_ROLES } from "@/lib/constants"

// Forzar runtime Node.js para poder usar Prisma (que requiere node:path/url)
export const runtime = "nodejs"

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/store",
  "/api/auth",
  "/api/v1/chatbot",
  "/_next",
  "/favicon",
  "/public",
]

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  // Obtener sesión de better-auth
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = (session.user as { role?: string }).role ?? ""

  // Rutas del panel de administración
  if (pathname.startsWith("/admin") && !ADMIN_ROLES.includes(role as never)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  // Rutas del POS
  if (pathname.startsWith("/pos") && !POS_ROLES.includes(role as never)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  // Rutas del staff (floristas, repartidores)
  if (pathname.startsWith("/staff") && !STAFF_ROLES.includes(role as never)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
