export type PortalRorJsonData = {
  id: string;
  name: string;
};

export class PortalRor {
  private _id: string;
  private _name: string;

  constructor(ror: Partial<PortalRorJsonData> = {}) {
    this._id = ror.id ?? "";
    this._name = ror.name ?? "";
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  toJson(): PortalRorJsonData {
    return { id: this.id, name: this.name };
  }

  static toObject(data: PortalRorJsonData): PortalRor {
    return new PortalRor(data);
  }

  static normalizeId(value: string): string | null {
    const id = value.trim().replace(/^(?:https?:\/\/)?ror\.org\//i, "").replace(/\/$/, "").toLowerCase();
    return /^0[0-9a-hj-km-np-tv-z]{6}\d{2}$/.test(id) ? `https://ror.org/${id}` : null;
  }

  static fromUser(user: { externalPersistentIdentifiers?: string[] }): PortalRor[] {
    return [...new Set((user.externalPersistentIdentifiers ?? [])
      .map(PortalRor.normalizeId).filter((id): id is string => !!id))]
      .map(id => new PortalRor({ id }));
  }

  static fromRecord(record: {
    id?: string;
    status?: string;
    names?: { value: string; types: string[] }[];
  }): PortalRor | null {
    const id = record.id ? PortalRor.normalizeId(record.id) : null;
    const name = record.names?.find((name) => name.types.includes("ror_display"))?.value
      || record.names?.find((name) => name.types.includes("label"))?.value;
    return id && name && record.status === "active" ? new PortalRor({ id, name }) : null;
  }
}
