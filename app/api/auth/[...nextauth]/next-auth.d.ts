import { DefaultSession, DefaultUser } from "next-auth";

declare module 'next-auth' {
	interface Session {
		reauthenticate?: boolean,
		user: {
			token?: string,
			username?: string
		} & DefaultSession['user'];
	}

	interface User extends DefaultUser {
		token?: string,
		username?: string,
		email?: string,
		expiration?: string | number
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		token?: string,
		username?: string,
		email?: string,
		expiration?: string | number,
		authVersion?: string,
		reauthenticate?: boolean
	}
}
