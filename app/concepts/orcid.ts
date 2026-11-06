type OrcidRecord = {
  person?: {
    name?: {
      "credit-name"?: { value?: string };
      "given-names"?: { value?: string };
      "family-name"?: { value?: string };
    };
  };
};

export type PortalOrcidJsonData = {
  id: string;
  name: string;
};

export type LinkedOrcidJsonData = {
  id: string;
  isPrimary: boolean;
};

export class PortalOrcid {
  private _id: string;
  private _name: string;
  private _isPrimary: boolean;

  constructor(orcid: Partial<PortalOrcidJsonData & LinkedOrcidJsonData> = {}) {
    this._id = orcid.id ?? "";
    this._name = orcid.name ?? "";
    this._isPrimary = orcid.isPrimary ?? false;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get isPrimary() {
    return this._isPrimary;
  }

  toJson(): PortalOrcidJsonData {
    return { id: this.id, name: this.name };
  }

  toLinkedJson(): LinkedOrcidJsonData {
    return { id: this.id, isPrimary: this.isPrimary };
  }

  static toObject(data: PortalOrcidJsonData | LinkedOrcidJsonData): PortalOrcid {
    return new PortalOrcid(data);
  }

  static normalizeId(value: string): string | null {
    const id = value.trim().replace(/^https?:\/\/orcid\.org\//i, "").replace(/\/$/, "").toUpperCase();
    return /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(id) ? id : null;
  }

  static isValid(id: string): boolean {
    return PortalOrcid.normalizeId(id) !== null;
  }

  static fromUser(user: {
    primaryOrcid?: string | null;
    externalPersistentIdentifiers?: string[];
  }): PortalOrcid[] {
    const primary = typeof user.primaryOrcid === "string" ? PortalOrcid.normalizeId(user.primaryOrcid) : null;
    return [...new Set([user.primaryOrcid, ...(user.externalPersistentIdentifiers ?? [])]
      .filter((id): id is string => typeof id === "string")
      .map(PortalOrcid.normalizeId)
      .filter((id): id is string => id !== null))]
      .map(id => new PortalOrcid({ id, isPrimary: id === primary }));
  }

  static fromRecord(id: string, record: OrcidRecord): PortalOrcid | null {
    const normalizedId = PortalOrcid.normalizeId(id);
    const name = record.person?.name;
    const displayName = name?.["credit-name"]?.value ||
      [name?.["given-names"]?.value, name?.["family-name"]?.value]
        .filter(Boolean).join(" ");
    return normalizedId && displayName ? new PortalOrcid({ id: normalizedId, name: displayName }) : null;
  }
}
