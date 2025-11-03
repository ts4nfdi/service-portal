import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = ({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      }, async authorize(credentials) {
        const req = await fetch(process.env.GATEWAY_BASE_URL! as string + "/auth/login", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });

        const user = await req.json();
        if (req.ok && user) {
          return { ...user, token: user?.token, username: user?.username };
        }
        return null;

      }
    })
  ],
  callbacks: {
    //@ts-ignore
    async jwt({ token, user }) {
      if (token?.expiration && new Date(token.expiration).getTime() < Date.now()) {
        return null;
      }
      if (user) {
        token.token = user.token;
        token.username = user.username;
        token.expiration = user.expiration;
      }

      return token;
    },
    //@ts-ignore
    async session({ session, token }) {
      if (!token) {
        return null;
      }
      session.user.token = token.token as string;
      session.user.username = token.username as string;
      return session;
    }
  },
  pages: {
    signIn: "/user/login",
    signOut: "/user/logout"
  },
  // url: process.env.NEXTAUTH_URL,
  secret: process.env.NEXTAUTH_SECRET
});
