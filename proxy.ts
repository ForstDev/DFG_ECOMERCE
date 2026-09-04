import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Gate for the admin area. Next 16 calls this file the proxy; it is the old
 * middleware convention under a new name. It only checks that a session cookie
 * is present, because the edge runtime cannot load the signing helper;
 * the real signature check runs again in the layout and in every admin API
 * route, which are the places that actually read or write data.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const hasCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (hasCookie) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = pathname === "/admin" ? "" : "?next=" + encodeURIComponent(pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
