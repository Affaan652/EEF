import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "eef_session";
const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "ACCOUNTANT"];

// Same idea as lib/auth.ts's getAdminRoute(), duplicated here because
// middleware runs on the Edge runtime and must not import server-only
// code (like lib/prisma.ts) that lib/auth.ts is otherwise fine to pull in.
const ADMIN_ROUTE_SECRET = process.env.ADMIN_ROUTE_SECRET || "admin";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET ?? "";
  return new TextEncoder().encode(secret);
}

async function readSession(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The real /admin folder is never reachable directly. Anyone hitting it
  // literally (including scanners guessing common admin paths) gets a
  // plain 404, whether or not they are logged in.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isSecretAdminPath =
    pathname === `/${ADMIN_ROUTE_SECRET}` ||
    pathname.startsWith(`/${ADMIN_ROUTE_SECRET}/`);
  const isPortalPath =
    pathname === "/portal" || pathname.startsWith("/portal/");

  if (!isSecretAdminPath && !isPortalPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await readSession(token);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isSecretAdminPath) {
    if (!ADMIN_ROLES.includes(session.role)) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
    // Internally serve the real /admin route tree, while the browser's
    // address bar keeps showing the secret path.
    const rewrittenPath = pathname.replace(
      new RegExp(`^/${ADMIN_ROUTE_SECRET}`),
      "/admin"
    );
    return NextResponse.rewrite(new URL(rewrittenPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
