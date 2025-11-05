import { Terminology } from "../api/actions/types";


export type PortalTerminologyJsonData = {
  label: string,
  source: string,
  type: string,
  uri: string,
}

export class PortalTerminology {
  private _label: string;
  private _source: string;
  private _type: string;
  private _uri: string;

  constructor(terminology: Terminology = {}) {
    this._label = terminology.label ?? "";
    this._source = terminology.source ?? "";
    this._type = terminology.type ?? "";
    this._uri = terminology.uri ?? "";
  }

  get label() {
    return this._label;
  }

  get source() {
    return this._source;
  }

  get type() {
    return this._type;
  }

  get uri() {
    return this._uri;
  }

  set label(value: string) {
    this._label = value;
  }

  set source(value: string) {
    this._source = value;
  }

  set uri(value: string) {
    this._uri = value;
  }

  set type(value: string) {
    this._type = value;
  }

  toJson(): PortalTerminologyJsonData {
    return {
      label: this.label,
      uri: this.uri,
      source: this.source,
      type: this.type
    };
  }


  static toObject(data: PortalTerminologyJsonData): PortalTerminology {
    let t = new PortalTerminology();
    t.type = data.type;
    t.label = data.label;
    t.source = data.source;
    t.uri = data.uri;
    return t;
  }

}

