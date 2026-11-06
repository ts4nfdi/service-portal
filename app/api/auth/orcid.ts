"use server";

import { normalizeOrcidId, LinkedOrcid, OrcidIdentity, toLinkedOrcids, toOrcidIdentity } from "@/app/concepts/orcid";
import { getHttpHeaderForGateway } from "@/app/libs/server_utils";

export async function getOrcidIdentity(orcid: string): Promise<OrcidIdentity | null> {
  const id = normalizeOrcidId(orcid);
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
    return toOrcidIdentity(id, await response.json());
  } catch {
    return null;
  }
}

export async function getUserOrcid(token: string): Promise<string | undefined> {
  return (await getUserOrcids(token))[0]?.id;
}

export async function getUserOrcids(token: string): Promise<LinkedOrcid[]> {
  return await loadUserOrcids(token) ?? [];
}

export async function loadUserOrcids(token: string): Promise<LinkedOrcid[] | null> {
  try {
    const response = await fetch(process.env.GATEWAY_BASE_URL! + "/auth/me", {
      headers: await getHttpHeaderForGateway(token),
      cache: "no-store",
    });
    if (!response.ok) return null;
    return toLinkedOrcids(await response.json());
  } catch {
    return null;
  }
}
