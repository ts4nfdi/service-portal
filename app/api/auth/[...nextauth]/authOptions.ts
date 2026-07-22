import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "OAuth callback",
      credentials: {
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.code) {
          return null;
        }

        const redirectUri = process.env.NEXTAUTH_URL!;
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
        const tokens = await tokenResponse.json();
        const loginResponse = await fetch(
          process.env.GATEWAY_BASE_URL! +
            "/auth/sso/login?redirect_url=" +
            redirectUri,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: tokens.access_token,
              id_token: tokens.id_token,
            }),
          },
        );
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
        };
      },
    }),
  ],
  callbacks: {
    //@ts-ignore
    async jwt({ token, user }) {
      if (
        token?.expiration &&
        new Date(token.expiration).getTime() < Date.now()
      ) {
        token.token = "";
        token.username = "";
        token.expiration = "";
        return token;
      }
      if (user) {
        token.token = user.token;
        token.username = user.username;
        token.email = user.email;
      }

      return token;
    },
    //@ts-ignore
    async session({ session, token }) {
      if (!token) {
        return { user: undefined };
      }
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

function getIdentity(idToken: string): Record<string, string> {
  try {
    return JSON.parse(
      Buffer.from(idToken.split(".")[1], "base64url").toString(),
    );
  } catch {
    return {};
  }
}
