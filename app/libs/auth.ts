'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import type { AuthenticatedUser } from "../api/auth/types";

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
