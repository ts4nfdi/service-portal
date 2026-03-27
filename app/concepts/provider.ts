import { Source } from "../api/actions/types";


export type PortalSourcesJsonData = {
  type: string;
  url: string;
  name: string;
  searchUrl: string;
  artefactsUrl: string;
  description: string;
  contactUrl: string;
  title: string;
  bartocUrl: string;
  logo: string;
  logo_background_color: string;
  homePage: string;
  logoW?: number;
  logoH?: number;
}

const defatultLogoW = 150;
const defatultLogoH = 150;


export class PortalProvider {
  private _type: string;
  private _url: string;
  private _name: string;
  private _searchUrl: string;
  private _artefactsUrl: string;
  private _description: string;
  private _contactUrl: string;
  private _title: string;
  private _bartocUrl: string;
  private _logo: string;
  private _logo_background_color: string;
  private _homePage: string;
  private _logoW: number;
  private _logoH: number;

  constructor(provider: Source = {}) {
    this._type = provider.type ?? "";
    this._url = provider.url ?? "";
    this._name = provider.name ?? "";
    this._searchUrl = provider.searchUrl ?? "";
    this._artefactsUrl = provider.artefactsUrl ?? "";
    this._description = "";
    this._contactUrl = "";
    this._title = "";
    this._bartocUrl = "";
    this._logo = "";
    this._logo_background_color = "";
    this._homePage = "";
    this._logoW = defatultLogoW;
    this._logoH = defatultLogoH;
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

  get logo(): string {
    return this._logo;
  }

  get logo_background_color(): string {
    return this._logo_background_color;
  }

  get homePage(): string {
    return this._homePage;
  }

  get logoW(): number {
    return this._logoW;
  }

  get logoH(): number {
    return this._logoH;
  }

  set type(val: string) {
    this._type = val;
  }

  set url(val: string) {
    this._url = val;
  }

  set homePage(val: string) {
    this._homePage = val;
  }
  set logo(val: string) {
    this._logo = val;
  }

  set logo_background_color(val: string) {
    this._logo_background_color = val;
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

  set logoW(val: number | undefined) {
    this._logoW = val ?? defatultLogoW;
  }
  set logoH(val: number | undefined) {
    this._logoH = val ?? defatultLogoH;
  }



  toJson(): PortalSourcesJsonData {
    return {
      type: this.type,
      url: this.url,
      name: this.name,
      searchUrl: this.searchUrl,
      artefactsUrl: this.artefactsUrl,
      description: this.description,
      contactUrl: this.contactUrl,
      title: this.title,
      bartocUrl: this.bartocUrl,
      logo: this.logo,
      logo_background_color: this.logo_background_color,
      homePage: this.homePage,
      logoW: this.logoW,
      logoH: this.logoH
    };
  }

  static toObject(data: PortalSourcesJsonData): PortalProvider {
    let pdb = new PortalProvider();
    pdb.type = data.type;
    pdb.url = data.url;
    pdb.name = data.name;
    pdb.searchUrl = data.searchUrl;
    pdb.artefactsUrl = data.artefactsUrl;
    pdb.description = data.description;
    pdb.contactUrl = data.contactUrl;
    pdb.title = data.title;
    pdb.bartocUrl = data.bartocUrl;
    pdb.logo = data.logo;
    pdb.logo_background_color = data.logo_background_color;
    pdb.homePage = data.homePage;
    pdb.logoW = data.logoW ?? defatultLogoW;
    pdb.logoH = data.logoH ?? defatultLogoH;
    return pdb;
  }
}

