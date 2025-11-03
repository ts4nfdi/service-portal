import { ZenodoPublication } from "../api/actions/types";


export type PortalPublicationJsonData = {
  doi: string;
  doi_url: string;
  title: string;
  created: string;
  metadata: { resource_type: { title: string } };
}



export class PortalPublication {
  private _doi: string;
  private _doi_url: string;
  private _title: string;
  private _metadata: { resource_type: { title: string } };
  private _created: string;

  constructor(pub: ZenodoPublication = {}) {
    this._doi = pub.doi ?? "";
    this._doi_url = pub.doi_url ?? "";
    this._title = pub.title ?? "";
    this._created = pub.created ?? "";
    this._metadata = pub.metadata ?? { resource_type: { title: "" } };
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

  get metadata() {
    return this._metadata;
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
  set metadata(val: { resource_type: { title: string } }) {
    this._metadata = val;
  }

  toJson(): PortalPublicationJsonData {
    return {
      doi: this.doi,
      doi_url: this.doi_url,
      title: this.title,
      created: this.created,
      metadata: this.metadata
    };
  }

  static toObject(pubData: PortalPublicationJsonData): PortalPublication {
    let pub = new PortalPublication();
    pub.doi = pubData.doi;
    pub.doi_url = pubData.doi_url;
    pub.created = pubData.created;
    pub.title = pubData.title;
    pub.metadata = pubData.metadata;
    return pub;
  }


}
