export type RorIdentity = {
  id: string;
  name: string;
};

export function normalizeRorId(value: string): string | null {
  const id = value.trim().replace(/^(?:https?:\/\/)?ror\.org\//i, "").replace(/\/$/, "").toLowerCase();
  return /^0[0-9a-hj-km-np-tv-z]{6}\d{2}$/.test(id) ? `https://ror.org/${id}` : null;
}

export function toLinkedRors(user: { externalPersistentIdentifiers?: string[] }): string[] {
  return [...new Set((user.externalPersistentIdentifiers ?? [])
    .map(normalizeRorId).filter((id): id is string => !!id))];
}

export function toRorIdentity(record: {
  id?: string;
  status?: string;
  names?: { value: string; types: string[] }[];
}): RorIdentity | null {
  const id = record.id ? normalizeRorId(record.id) : null;
  const name = record.names?.find((name) => name.types.includes("ror_display"))?.value
    || record.names?.find((name) => name.types.includes("label"))?.value;
  return id && name && record.status === "active" ? { id, name } : null;
}
