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

export function toOrcidIdentity(id: string, record: OrcidRecord): OrcidIdentity | null {
  const name = record.person?.name;
  const displayName = name?.["credit-name"]?.value ||
    [name?.["given-names"]?.value, name?.["family-name"]?.value]
      .filter(Boolean).join(" ");
  return displayName ? { id, name: displayName } : null;
}
