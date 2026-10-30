export function getCodeUrl(gatewayUrl?: string) {
  if (process.env.NEXT_PUBLIC_SSO_PKCE_ENABLED === "true") {
    return "/api/sso/login";
  }
  const redirectUri =
    process.env.NEXT_IAM_REDIRECT_URL ??
    "https://terminology.services.base4nfdi.de/";
  const authorizeUrl = new URL(
    "/api-gateway/auth/sso/authorize",
    gatewayUrl ?? process.env.GATEWAY_BASE_URL,
  );
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  return authorizeUrl.toString();
}
