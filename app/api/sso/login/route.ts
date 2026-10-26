import { NextRequest, NextResponse } from "next/server";
import { createSsoPkce } from "@/app/libs/ssoPkce";

export async function GET(request: NextRequest) {
  const redirectUri =
    process.env.NEXT_IAM_REDIRECT_URL ??
    request.nextUrl.origin ??
    "https://terminology.services.base4nfdi.de/";
  const authorizeUrl = new URL(
    "/api-gateway/auth/sso/authorize",
    process.env.GATEWAY_BASE_URL,
  );
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  if (process.env.NEXT_PUBLIC_SSO_PKCE_ENABLED === "true") {
    const pkce = await createSsoPkce(
      redirectUri,
      new URL(process.env.NEXTAUTH_URL ?? request.url).protocol === "https:",
    );
    for (const [name, value] of Object.entries(pkce)) {
      authorizeUrl.searchParams.set(name, value);
    }
  }
  return NextResponse.redirect(authorizeUrl);
}
