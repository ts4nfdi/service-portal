export function getCodeUrl() {
  return "/api/sso/login";
}

export function getSsoRedirectUri() {
  const redirectUri = process.env.NEXT_IAM_REDIRECT_URL ?? process.env.NEXTAUTH_URL;
  if (!redirectUri) {
    throw new Error("NEXT_IAM_REDIRECT_URL or NEXTAUTH_URL must be configured");
  }
  return redirectUri;
}
