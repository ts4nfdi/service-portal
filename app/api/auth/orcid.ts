"use server";

import { OrcidIdentity, toOrcidIdentity } from "@/app/concepts/orcid";

export async function getOrcidIdentity(orcid: string): Promise<OrcidIdentity | null> {
  if (!/^\d{4}-\d{4}-\d{4}-[\dX]{4}$/.test(orcid)) {
    return null;
  }

  try {
    const response = await fetch(`https://orcid.org/${orcid}`, {
      headers: { Accept: "application/json" },
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

export async function updateUserOrcid(_orcid: string): Promise<boolean> {
  // The backend update endpoint is not available yet.
  return false;
}
