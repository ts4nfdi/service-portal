import { Database } from "../api/actions/types";


export type PortalDatabaseJsonData = {
  type: string;
  url: string;
  name: string;
  searchUrl: string;
  artefactsUrl: string;
  description: string;
  contactUrl: string;
  title: string;
  bartocUrl: string;
}


export class PortalDatabase {
  private _type: string;
  private _url: string;
  private _name: string;
  private _searchUrl: string;
  private _artefactsUrl: string;
  private _description: string;
  private _contactUrl: string;
  private _title: string;
  private _bartocUrl: string;

  constructor(dbData: Database = {}) {
    this._type = dbData.type ?? "";
    this._url = dbData.url ?? "";
    this._name = dbData.name ?? "";
    this._searchUrl = dbData.searchUrl ?? "";
    this._artefactsUrl = dbData.artefactsUrl ?? "";
    this._description = "";
    this._contactUrl = "";
    this._title = "";
    this._bartocUrl = "";
  }

  get type() {
    return this._type;
  }

  get url() {
    return this._url;
  }

  get name() {
    return this._name;
  }

  get searchUrl() {
    return this._searchUrl;
  }

  get artefactsUrl() {
    return this._artefactsUrl;
  }
  get description(): string {
    return this._description;
  }
  get contactUrl(): string {
    return this._contactUrl;
  }
  get title(): string {
    return this._title;
  }

  get bartocUrl(): string {
    return this._bartocUrl;
  }

  set type(val: string) {
    this._type = val;
  }

  set url(val: string) {
    this._url = val;
  }

  set name(val: string) {
    this._name = val;
  }

  set searchUrl(val: string) {
    this._searchUrl = val;
  }

  set artefactsUrl(val: string) {
    this._artefactsUrl = val;
  }

  set description(val: { [key: string]: string[] } | string) {
    if (typeof val === "string") {
      this._description = val;
    } else if ("en" in val) {
      this._description = val["en"].join("\n");
    } else {
      this._description = "";
    }
  }

  set contactUrl(val: string) {
    this._contactUrl = val;
  }

  set title(val: { [key: string]: string } | string) {
    if (typeof val === "string") {
      this._title = val;
    } else if ("en" in val) {
      this._title = val["en"];
    } else {
      this._title = "";
    }
  }

  set bartocUrl(val: string) {
    this._bartocUrl = val;
  }

  toJson(): PortalDatabaseJsonData {
    return {
      type: this.type,
      url: this.url,
      name: this.name,
      searchUrl: this.searchUrl,
      artefactsUrl: this.artefactsUrl,
      description: this.description,
      contactUrl: this.contactUrl,
      title: this.title,
      bartocUrl: this.bartocUrl
    };
  }

  static toObject(data: PortalDatabaseJsonData): PortalDatabase {
    let pdb = new PortalDatabase();
    pdb.type = data.type;
    pdb.url = data.url;
    pdb.name = data.name;
    pdb.searchUrl = data.searchUrl;
    pdb.artefactsUrl = data.artefactsUrl;
    pdb.description = data.description;
    pdb.contactUrl = data.contactUrl;
    pdb.title = data.title;
    pdb.bartocUrl = data.bartocUrl;
    return pdb;
  }
}

