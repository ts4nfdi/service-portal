'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";


export async function getAuthenticatedUser(): Promise<{ token: string, username: string }> {
  try {
    let session = await getServerSession(authOptions);
    return {
      token: session?.user?.token ?? "",
      username: session?.user?.username ?? ""
    };
  } catch {
    return { token: "", username: "" };
  }
}

export async function getUserToken(): Promise<string> {
  return (await getAuthenticatedUser()).token;
}
