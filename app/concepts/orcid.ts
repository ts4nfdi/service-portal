type OrcidRecord = {
  person?: {
    name?: {
      "credit-name"?: { value?: string };
      "given-names"?: { value?: string };
      "family-name"?: { value?: string };
    };
  };
};

export type OrcidIdentity = {
  id: string;
  name: string;
};

export type LinkedOrcid = {
  id: string;
  isPrimary: boolean;
};

export function normalizeOrcidId(value: string): string | null {
  const id = value.trim().replace(/^https?:\/\/orcid\.org\//i, "").replace(/\/$/, "").toUpperCase();
  return /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(id) ? id : null;
}

export function toLinkedOrcids(user: {
  primaryOrcid?: string | null;
  externalPersistentIdentifiers?: string[];
}): LinkedOrcid[] {
  const primary = typeof user.primaryOrcid === "string" ? normalizeOrcidId(user.primaryOrcid) : null;
  return [...new Set([user.primaryOrcid, ...(user.externalPersistentIdentifiers ?? [])]
    .filter((id): id is string => typeof id === "string")
    .map(normalizeOrcidId)
    .filter((id): id is string => id !== null))]
    .map(id => ({ id, isPrimary: id === primary }));
}

export function isOrcidId(id: string): boolean {
  return normalizeOrcidId(id) !== null;
}

export function toOrcidIdentity(id: string, record: OrcidRecord): OrcidIdentity | null {
  const normalizedId = normalizeOrcidId(id);
  const name = record.person?.name;
  const displayName = name?.["credit-name"]?.value ||
    [name?.["given-names"]?.value, name?.["family-name"]?.value]
      .filter(Boolean).join(" ");
  return normalizedId && displayName ? { id: normalizedId, name: displayName } : null;
}
