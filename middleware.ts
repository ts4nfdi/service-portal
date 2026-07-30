import { NextRequest, NextResponse } from "next/server";

const localeCookie = "locale";

function withLocale(response: NextResponse, locale: "en" | "de") {
  response.cookies.set(localeCookie, locale, { path: "/", sameSite: "lax" });
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || /\.[^/]+$/.test(pathname)) return NextResponse.next();
  const requestedLocale = request.nextUrl.searchParams.get("locale");
  if (requestedLocale === "en" || requestedLocale === "de") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("locale");
    const path = pathname.replace(/^\/(en|de)(?=\/|$)/, "") || "/";
    url.pathname = requestedLocale === "de" ? `/de${path === "/" ? "" : path}` : path;
    return withLocale(NextResponse.redirect(url), requestedLocale);
  }
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return withLocale(NextResponse.redirect(url), "en");
  }
  if (pathname === "/de" || pathname.startsWith("/de/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    const headers = new Headers(request.headers);
    headers.set("x-locale", "de");
    return withLocale(NextResponse.rewrite(url, { request: { headers } }), "de");
  }
  const headers = new Headers(request.headers);
  headers.set("x-locale", "en");
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/((?!favicon.ico).*)"] };
