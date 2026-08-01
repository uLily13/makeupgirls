import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Host-based routing: requests to the admin subdomain (admin.makeupgirls.mn,
// or admin.localhost:3000 in dev) are served from the /admin route tree, so the
// admin panel lives on its own hostname while sharing one codebase + database.
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0].toLowerCase();
  const isAdminHost = host.startsWith("admin.");
  const { pathname } = req.nextUrl;

  if (isAdminHost && !pathname.startsWith("/admin")) {
    const url = req.nextUrl.clone();
    url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals and static files (anything with a dot in the last seg).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
