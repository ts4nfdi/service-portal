import { Database } from "../api/actions/types";


export type PortalDatabaseJsonData = {
  type: string;
  url: string;
  name: string;
  searchUrl: string;
  artefactsUrl: string;
}


export class PortalDatabase {
  private _type: string;
  private _url: string;
  private _name: string;
  private _searchUrl: string;
  private _artefactsUrl: string;

  constructor(dbData: Database = {}) {
    this._type = dbData.type ?? "";
    this._url = dbData.url ?? "";
    this._name = dbData.url ?? "";
    this._searchUrl = dbData.searchUrl ?? "";
    this._artefactsUrl = dbData.artefactsUrl ?? "";
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

  toJson(): PortalDatabaseJsonData {
    return {
      type: this.type,
      url: this.url,
      name: this.name,
      searchUrl: this.searchUrl,
      artefactsUrl: this.artefactsUrl
    };
  }

  static toObject(data: PortalDatabaseJsonData): PortalDatabase {
    let pdb = new PortalDatabase();
    pdb.type = data.type;
    pdb.url = data.url;
    pdb.name = data.name;
    pdb.searchUrl = data.searchUrl;
    pdb.artefactsUrl = data.artefactsUrl;
    return pdb;
  }
}

