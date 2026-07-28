export function getCodeUrl() {
  const redirectUri =
    process.env.NEXT_IAM_REDIRECT_URL ??
    "https://terminology.services.base4nfdi.de/";
  const authorizeUrl = new URL(
    "/api-gateway/auth/sso/authorize",
    process.env.GATEWAY_BASE_URL ??
      process.env.NEXT_PUBLIC_API_GATEWAY_ENDPOINT,
  );
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  return authorizeUrl.toString();
}
