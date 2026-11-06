'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";

export type AuthenticatedUser = {
  token: string;
  username: string;
  orcid: string;
};

export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  try {
    let session = await getServerSession(authOptions);
    return {
      token: session?.user?.token ?? "",
      username: session?.user?.username ?? "",
      orcid: session?.user?.orcid ?? ""
    };
  } catch {
    return { token: "", username: "", orcid: "" };
  }
}
