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

export function toLinkedOrcids(user: {
  primaryOrcid?: string | null;
  externalPersistentIdentifiers?: string[];
}): LinkedOrcid[] {
  const normalize = (id: string) => id.trim().replace(/^https?:\/\/orcid\.org\//i, "").toUpperCase();
  const primary = typeof user.primaryOrcid === "string" ? normalize(user.primaryOrcid) : null;
  return [...new Set([user.primaryOrcid, ...(user.externalPersistentIdentifiers ?? [])]
    .filter((id): id is string => typeof id === "string")
    .map(normalize)
    .filter(id => /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(id)))]
    .map(id => ({ id, isPrimary: id === primary }));
}

export function toOrcidIdentity(id: string, record: OrcidRecord): OrcidIdentity | null {
  const name = record.person?.name;
  const displayName = name?.["credit-name"]?.value ||
    [name?.["given-names"]?.value, name?.["family-name"]?.value]
      .filter(Boolean).join(" ");
  return displayName ? { id, name: displayName } : null;
}
