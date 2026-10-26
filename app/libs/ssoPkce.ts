import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "sso-pkce";
const maxAge = 600;

export async function createSsoPkce(redirectUri: string, secure: boolean) {
  const verifier = randomBytes(32).toString("base64url");
  const state = randomBytes(32).toString("base64url");
  (await cookies()).set(cookieName, JSON.stringify({
    verifier,
    state,
    redirectUri,
    expiresAt: Date.now() + maxAge * 1000,
  }), { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge });
  return {
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    code_challenge_method: "S256",
    state,
  };
}

export async function consumeSsoPkce(state?: string) {
  const cookieStore = await cookies();
  const value = cookieStore.get(cookieName)?.value;
  cookieStore.delete(cookieName);
  let pkce;
  try {
    pkce = JSON.parse(value ?? "null");
  } catch {
    throw new Error("InvalidPkceState");
  }
  if (!state || !pkce || pkce.state !== state ||
      typeof pkce.verifier !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(pkce.verifier) ||
      typeof pkce.redirectUri !== "string" ||
      typeof pkce.expiresAt !== "number" || pkce.expiresAt <= Date.now()) {
    throw new Error("InvalidPkceState");
  }
  return { code_verifier: pkce.verifier as string, redirect_uri: pkce.redirectUri as string };
}
