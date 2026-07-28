import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const redirectUri = process.env.IAM_REDIRECT_URL ?? request.nextUrl.origin;
  const authorizeUrl = new URL(
    "/api-gateway/auth/sso/authorize",
    process.env.GATEWAY_BASE_URL,
  );
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  return NextResponse.redirect(authorizeUrl);
}
