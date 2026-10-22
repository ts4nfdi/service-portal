"use server";

import { isOrcidId, LinkedOrcid, OrcidIdentity, toLinkedOrcids, toOrcidIdentity } from "@/app/concepts/orcid";
import { getHttpHeaderForGateway } from "@/app/libs/server_utils";

export async function getOrcidIdentity(orcid: string): Promise<OrcidIdentity | null> {
  orcid = orcid.trim().replace(/^https?:\/\/orcid\.org\//i, "").toUpperCase();
  if (!isOrcidId(orcid)) {
    return null;
  }

  try {
    const response = await fetch(`https://pub.orcid.org/v3.0/${orcid}/record`, {
      headers: { Accept: "application/vnd.orcid+json" },
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    return toOrcidIdentity(orcid, await response.json());
  } catch {
    return null;
  }
}

export async function getUserOrcid(token: string): Promise<string | undefined> {
  return (await getUserOrcids(token))[0]?.id;
}

export async function getUserOrcids(token: string): Promise<LinkedOrcid[]> {
  try {
    const response = await fetch(process.env.GATEWAY_BASE_URL! + "/auth/me", {
      headers: await getHttpHeaderForGateway(token),
      cache: "no-store",
    });
    if (!response.ok) return [];
    return toLinkedOrcids(await response.json());
  } catch {
    return [];
  }
}

export async function updateUserOrcid(orcid: string): Promise<boolean> {
  try {
    const { getUserToken } = await import("@/app/libs/auth");
    const token = await getUserToken();
    if (!token || !await getOrcidIdentity(orcid)) return false;
    const response = await fetch(process.env.GATEWAY_BASE_URL! + "/users/me/externalIdentifiers", {
      method: "POST",
      headers: { "Content-Type": "text/plain", Authorization: `Bearer ${token}` },
      body: orcid,
    });
    return response.ok;
  } catch {
    return false;
  }
}
