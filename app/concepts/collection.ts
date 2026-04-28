import {Collection} from "../api/actions/types";
import {PortalTerminology, PortalTerminologyJsonData} from "./terminology";


export type PortalCollectionJsonData = {
    id: string,
    creator: string,
    description: string,
    label: string,
    isPublic: boolean,
    collaborators: { username: string, role: string }[],
    terminologies: PortalTerminologyJsonData[]
}


export class PortalCollection {
    private _id: string;
    private _creator: string;
    private _description: string;
    private _label: string;
    private _isPublic: boolean;
    private _collaborators: { username: string, role: string }[];
    private _terminologies: PortalTerminology[];

    constructor(collection: Collection = {}) {
        this._description = collection.description ?? "";
        this._id = collection.id ?? "";
        this._creator = collection.creator ?? "";
        this._label = collection.label ?? "";
        this._isPublic = collection.isPublic ?? false;
        this._collaborators = collection.collaborators ?? [];
        this._terminologies = this._buildTerminologies(collection);
    }

    get id() {
        return this._id;
    }

    get creator() {
        return this._creator;
    }

    get description() {
        return this._description;
    }

    get label() {
        return this._label;
    }

    get isPublic() {
        return this._isPublic;
    }

    get collaborators() {
        return this._collaborators;
    }

    get terminologies() {
        return this._terminologies;
    }

    set id(value: string) {
        this._id = value;
    }

    set creator(value: string) {
        this._creator = value;
    }

    set description(value: string) {
        this._description = value;
    }

    set label(value: string) {
        this._label = value;
    }

    set isPublic(value: boolean) {
        this._isPublic = value;
    }

    set collaborators(value: { username: string, role: string }[]) {
        this._collaborators = value;
    }

    set terminologies(value: PortalTerminology[]) {
        this._terminologies = value;
    }

    toJson(): PortalCollectionJsonData {
        let jsonTerminologies = [];
        for (let t of this.terminologies) {
            jsonTerminologies.push(t.toJson());
        }
        return {
            id: this.id,
            creator: this.creator,
            description: this.description,
            label: this.label,
            isPublic: this.isPublic,
            collaborators: this.collaborators,
            terminologies: jsonTerminologies
        };
    }


    static toObject(data: PortalCollectionJsonData): PortalCollection {
        let pcol = new PortalCollection();
        pcol.id = data.id;
        pcol.creator = data.creator;
        pcol.description = data.description;
        pcol.label = data.label;
        pcol.isPublic = data.isPublic;
        pcol.collaborators = data.collaborators;
        pcol.terminologies = [];
        for (let t of (data.terminologies ?? [])) {
            pcol.terminologies.push(PortalTerminology.toObject(t));
        }
        return pcol;
    }


    private _buildTerminologies(collection: Collection) {
        let res = [];
        for (let t of (collection.terminologies ?? [])) {
            let pTerminology = new PortalTerminology(t);
            res.push(pTerminology);
        }
        return res;
    }


}

