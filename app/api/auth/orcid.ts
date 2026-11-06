"use server";

import { PortalOrcid, type LinkedOrcidJsonData, type PortalOrcidJsonData } from "@/app/concepts/orcid";
import { getHttpHeaderForGateway } from "@/app/libs/server_utils";

export async function getOrcidIdentity(orcid: string): Promise<PortalOrcidJsonData | null> {
  const id = PortalOrcid.normalizeId(orcid);
  if (!id) {
    return null;
  }

  try {
    const response = await fetch(`https://pub.orcid.org/v3.0/${id}/record`, {
      headers: { Accept: "application/vnd.orcid+json" },
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    return PortalOrcid.fromRecord(id, await response.json())?.toJson() ?? null;
  } catch {
    return null;
  }
}

export async function getUserOrcid(token: string): Promise<string | undefined> {
  return (await getUserOrcids(token))[0]?.id;
}

export async function getUserOrcids(token: string): Promise<LinkedOrcidJsonData[]> {
  return await loadUserOrcids(token) ?? [];
}

export async function loadUserOrcids(token: string): Promise<LinkedOrcidJsonData[] | null> {
  try {
    const response = await fetch(process.env.GATEWAY_BASE_URL! + "/auth/me", {
      headers: await getHttpHeaderForGateway(token),
      cache: "no-store",
    });
    if (!response.ok) return null;
    return PortalOrcid.fromUser(await response.json()).map(orcid => orcid.toLinkedJson());
  } catch {
    return null;
  }
}
