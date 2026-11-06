import {Collection} from "../api/actions/types";
import {PortalTerminology, PortalTerminologyJsonData} from "./terminology";
import { PortalOrcid } from "./orcid";
import { PortalRor } from "./ror";

export type CollectionCreatorIdentity = {
    id: string;
    isPrimary: boolean;
};

export function toCollectionCreatorIdentities(user: Parameters<typeof PortalOrcid.fromUser>[0]): CollectionCreatorIdentity[] {
    return [
        ...PortalOrcid.fromUser(user).map(orcid => orcid.toLinkedJson()),
        ...PortalRor.fromUser(user).map(ror => ({ id: ror.id, isPrimary: false })),
    ];
}


export type PortalCollectionStatistics = {
    created: string;
    properties?: number;
    classes?: number;
    namedIndividuals?: number;
    concepts?: number;
};

export type PortalCollectionJsonData = {
    id: string,
    permaLink?: string,
    creator: string,
    manageable?: boolean,
    description: string,
    label: string,
    isPublic: boolean,
    collaborators: { username: string, orcid?: string | null, role: string }[],
    terminologies: PortalTerminologyJsonData[],
    statistics?: PortalCollectionStatistics,
}


export class PortalCollection {
    private _id: string;
    private _creator: string = "";
    private _manageable: boolean;
    private _description: string;
    private _label: string;
    private _isPublic: boolean;
    private _collaborators: { username: string, orcid?: string | null, role: string }[] = [];
    private _terminologies: PortalTerminology[];
    private _statistics?: PortalCollectionStatistics;

    constructor(collection: Collection = {}) {
        this._description = collection.description ?? "";
        this._id = collection.id ?? "";
        this.creator = collection.creator ?? "";
        this._manageable = false;
        this._label = collection.label ?? "";
        this._isPublic = collection.isPublic ?? false;
        this.collaborators = collection.collaborators ?? [];
        this._terminologies = this._buildTerminologies(collection);
        const latest = collection.statistics?.slice().sort((a, b) => b.created.localeCompare(a.created))[0];
        if (latest) {
            this._statistics = {
                created: latest.created,
                properties: latest.count["http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"],
                classes: latest.count["http://www.w3.org/2002/07/owl#Class"],
                namedIndividuals: latest.count["http://www.w3.org/2002/07/owl#NamedIndividual"],
                concepts: latest.count["http://www.w3.org/2004/02/skos/core#Concept"],
            };
        }
    }

    get id() {
        return this._id;
    }

    get permaLink() {
        return `https://w3id.org/ts4nfdi/collection/${this._id}`;
    }

    get creator() {
        return this._creator;
    }

    get manageable() {
        return this._manageable;
    }

    creatorIdentity() {
        return {
            id: this.creator,
            url: PortalOrcid.isValid(this.creator) ? `https://orcid.org/${this.creator}` : PortalRor.normalizeId(this.creator),
        };
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

    get statistics() {
        return this._statistics;
    }

    canManage(username?: string, orcid?: string) {
        orcid = PortalOrcid.normalizeId(orcid ?? "") ?? orcid;
        return this.manageable || (!!(username || orcid) && ([username, orcid].includes(this.creator) || this.collaborators.some((user) => [username, orcid].includes(user.username) || (!!orcid && user.orcid === orcid))));
    }

    set id(value: string) {
        this._id = value;
    }

    set creator(value: string) {
        this._creator = PortalOrcid.normalizeId(value) ?? value;
    }

    set manageable(value: boolean) {
        this._manageable = value;
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

    set collaborators(value: { username: string, orcid?: string | null, role: string }[]) {
        this._collaborators = value.map(user => ({
            ...user,
            orcid: user.orcid ? PortalOrcid.normalizeId(user.orcid) ?? user.orcid : user.orcid,
        }));
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
            permaLink: this.permaLink,
            creator: this.creator,
            manageable: this.manageable,
            description: this.description,
            label: this.label,
            isPublic: this.isPublic,
            collaborators: this.collaborators,
            terminologies: jsonTerminologies,
            statistics: this.statistics,
        };
    }


    static toObject(data: PortalCollectionJsonData): PortalCollection {
        let pcol = new PortalCollection();
        pcol.id = data.id;
        pcol.creator = data.creator;
        pcol.manageable = data.manageable ?? false;
        pcol.description = data.description;
        pcol.label = data.label;
        pcol._statistics = data.statistics;
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
