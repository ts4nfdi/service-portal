"use server";

import type { LinkedOrcid } from "@/app/concepts/orcid";
import { getAuthenticatedUser } from "@/app/libs/auth";
import { getOrcidIdentity, loadUserOrcids } from "./orcid";

export async function getCurrentUserOrcids(): Promise<LinkedOrcid[] | null> {
  const { token } = await getAuthenticatedUser();
  return token ? loadUserOrcids(token) : null;
}

export async function updateUserOrcid(orcid: string): Promise<boolean> {
  try {
    const { token } = await getAuthenticatedUser();
    if (!token) return false;
    const identity = await getOrcidIdentity(orcid);
    if (!identity) return false;
    const response = await fetch(process.env.GATEWAY_BASE_URL! + "/users/me/externalIdentifiers", {
      method: "POST",
      headers: { "Content-Type": "text/plain", Authorization: `Bearer ${token}` },
      body: identity.id,
    });
    return response.ok;
  } catch {
    return false;
  }
}
