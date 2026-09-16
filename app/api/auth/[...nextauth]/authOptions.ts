import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";

type SsoTokens = {
  access_token: string;
  id_token: string;
};

const pendingRegistrations = new Map<
  string,
  { tokens: SsoTokens; expiresAt: number }
>();
const registrationTtl = 5 * 60 * 1000;
const authVersion = "gateway-expiration-v1";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "OAuth callback",
      credentials: {
        code: { label: "Code", type: "text" },
        username: { label: "Username", type: "text" },
        registrationId: { label: "Registration ID", type: "text" },
      },
      async authorize(credentials) {
        if (credentials?.registrationId && credentials.username) {
          const registration = pendingRegistrations.get(credentials.registrationId);
          pendingRegistrations.delete(credentials.registrationId);
          if (!registration || registration.expiresAt < Date.now()) {
            return null;
          }
          const registerResponse = await fetch(
            process.env.GATEWAY_BASE_URL! + "/auth/register",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: credentials.username,
                id_token: registration.tokens.id_token,
              }),
            },
          );
          if (!registerResponse.ok) {
            return null;
          }
          return await loginUser(registration.tokens);
        }

        if (!credentials?.code) {
          return null;
        }

        const redirectUri =
          process.env.NEXT_IAM_REDIRECT_URL ??
          "https://terminology.services.base4nfdi.de/";
        const tokenResponse = await fetch(
          process.env.GATEWAY_BASE_URL! + "/auth/sso/token",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: credentials.code,
              redirect_uri: redirectUri,
            }),
          },
        );
        if (!tokenResponse.ok) {
          return null;
        }
        const tokens = (await tokenResponse.json()) as SsoTokens;
        let loginResponse = await loginWithTokens(tokens);
        if (loginResponse.status === 401) {
          const registrationId = crypto.randomUUID();
          pendingRegistrations.set(registrationId, {
            tokens,
            expiresAt: Date.now() + registrationTtl,
          });
          throw new Error(`UserNotRegistered:${registrationId}`);
        }
        if (!loginResponse.ok) {
          return null;
        }

        return await loginUser(tokens, loginResponse);
      },
    }),
  ],
  callbacks: {
    //@ts-ignore
    async jwt({ token, user }) {
      if (user) {
        token.token = user.token;
        token.username = user.username;
        token.email = user.email;
        token.expiration = user.expiration;
        token.authVersion = authVersion;
        token.reauthenticate = false;
      }
      if (token.authVersion !== authVersion) {
        requireReauthentication(token);
        return token;
      }
      if (token.expiration === undefined || token.expiration === "") {
        requireReauthentication(token);
        return token;
      }
      const expiration = getExpirationTime(token.expiration);
      if (!Number.isFinite(expiration) || expiration <= Date.now()) {
        requireReauthentication(token);
      }

      return token;
    },
    //@ts-ignore
    async session({ session, token }) {
      if (!token) {
        return { user: undefined };
      }
      session.reauthenticate = token.reauthenticate === true;
      session.user.token = token.token as string;
      session.user.username = token.username as string;
      session.user.email = token.email as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/user/login",
    signOut: "/user/logout",
  },
  // url: process.env.NEXTAUTH_URL,
  secret: process.env.NEXTAUTH_SECRET,
};

function requireReauthentication(token: JWT) {
  token.token = "";
  token.username = "";
  token.email = "";
  token.expiration = "";
  token.reauthenticate = true;
}

function getExpirationTime(expiration: string | number) {
  if (typeof expiration === "number") {
    return expiration;
  }
  return /^\d+$/.test(expiration) ? Number(expiration) : Date.parse(expiration);
}

function getIdentity(idToken: string): Record<string, string> {
  try {
    return JSON.parse(
      Buffer.from(idToken.split(".")[1], "base64url").toString(),
    );
  } catch {
    return {};
  }
}

async function loginUser(tokens: SsoTokens, response?: Response) {
  const loginResponse = response ?? await loginWithTokens(tokens);
  if (!loginResponse.ok) {
    return null;
  }

  const user = await loginResponse.json();
  const identity = getIdentity(tokens.id_token);
  const token = user.token ?? user.jwt ?? user.access_token;
  if (!token) {
    return null;
  }

  const username =
    user.username ??
    identity.preferred_username ??
    identity.name ??
    "User";
  return {
    id: username,
    token,
    username,
    email: user.email ?? identity.email,
    expiration: user.expiration,
  };
}

function loginWithTokens(tokens: SsoTokens) {
  return fetch(process.env.GATEWAY_BASE_URL! + "/auth/sso/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_token: tokens.access_token,
      id_token: tokens.id_token,
    }),
  });
}
