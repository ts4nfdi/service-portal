import { ZenodoPublication } from "../api/actions/types";


export type PortalPublicationJsonData = {
  doi: string;
  doi_url: string;
  title: string;
  created: string;
  type: string;
  description: string;
}



export class PortalPublication {
  private _doi: string;
  private _doi_url: string;
  private _title: string;
  private _type: string;
  private _created: string;
  private _description: string;

  constructor(pub: ZenodoPublication = {}) {
    this._doi = pub.doi ?? "";
    this._doi_url = pub.doi_url ?? "";
    this._title = pub.title ?? "";
    this._created = pub.created ?? "";
    this._type = pub.metadata?.resource_type?.title ?? "unknown";
    this._description = pub.metadata?.description ?? "";
  }

  get doi() {
    return this._doi;
  }

  get doi_url() {
    return this._doi_url;
  }

  get title() {
    return this._title;
  }

  get created() {
    return this._created;
  }

  get type() {
    return this._type;
  }

  get description() {
    return this._description;
  }

  set doi(val: string) {
    this._doi = val;
  }
  set doi_url(val: string) {
    this._doi_url = val;
  }
  set title(val: string) {
    this._title = val;
  }
  set created(val: string) {
    this._created = val;
  }
  set type(val: string) {
    this._type = val;
  }

  set description(val: string) {
    this._description = val;
  }

  toJson(): PortalPublicationJsonData {
    return {
      doi: this.doi,
      doi_url: this.doi_url,
      title: this.title,
      created: this.created,
      type: this.type,
      description: this.description
    };
  }

  static toObject(pubData: PortalPublicationJsonData): PortalPublication {
    let pub = new PortalPublication();
    pub.doi = pubData.doi;
    pub.doi_url = pubData.doi_url;
    pub.created = pubData.created;
    pub.title = pubData.title;
    pub.type = pubData.type;
    pub.description = pubData.description;
    return pub;
  }


}
