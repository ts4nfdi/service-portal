import type { DefaultSession, DefaultUser } from "next-auth";

export type SignUpFormProps = {
  username: string,
  passoword: string,
  captcha: string
}

export type AuthenticatedUser = {
  token: string;
  username: string;
  orcid: string;
};

export type SsoTokens = {
  access_token: string;
  id_token: string;
};

export type PendingRegistration = {
  tokens: SsoTokens;
  expiresAt: number;
};

declare module 'next-auth' {
	interface Session {
		reauthenticate?: boolean,
		user: {
			token?: string,
			username?: string
			orcid?: string
		} & DefaultSession['user'];
	}

	interface User extends DefaultUser {
		token?: string,
		username?: string,
		orcid?: string,
		email?: string,
		expiration?: string | number
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		token?: string,
		username?: string,
		orcid?: string,
		email?: string,
		expiration?: string | number,
		authVersion?: string,
		reauthenticate?: boolean
	}
}
