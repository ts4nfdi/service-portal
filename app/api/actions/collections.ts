'use server'

import {ActionResponse, Collection, Terminology} from "./types";
import {getUserToken} from "@/app/libs/auth";
import {getHttpHeaderForGateway} from "@/app/libs/server_utils";
import {scheduleCollectionStatistics} from "@/app/libs/collectionStatistics";
import {
    ACTION_NOT_ALLOWED_MESSAGE,
    REQUEST_FAILED_MESSAGE,
    SERVER_ERROR_MESSAGE,
    MANDATORY_FIELDS_MISSING_MESSAGE
} from "@/app/libs/responseStrings";
import {CollectionCreatorIdentity, PortalCollection, PortalCollectionJsonData, toCollectionCreatorIdentities} from "@/app/concepts";

export async function getCollectionCreatorIdentities(): Promise<CollectionCreatorIdentity[] | null> {
    const token = await getUserToken();
    return token ? loadCollectionCreatorIdentities(token) : null;
}

async function loadCollectionCreatorIdentities(token: string): Promise<CollectionCreatorIdentity[] | null> {
    try {
        const response = await fetch(process.env.GATEWAY_BASE_URL! + "/auth/me", {
            headers: await getHttpHeaderForGateway(token),
            cache: "no-store",
        });
        return response.ok ? toCollectionCreatorIdentities(await response.json()) : null;
    } catch {
        return null;
    }
}


export async function getUserCollectionList(): Promise<ActionResponse> {
    try {
        let token = await getUserToken();
        if (!token) {
            return {status: false, content: ACTION_NOT_ALLOWED_MESSAGE}
        }
        let resp = await fetch((process.env.GATEWAY_BASE_URL! as string) + "/users/collections/", {
            headers: await getHttpHeaderForGateway(token),
            cache: "no-store",
        });
        if (!resp.ok) {
            return {status: false, content: REQUEST_FAILED_MESSAGE}
        }
        let res: Collection[] = await resp.json();
        let portalCols: PortalCollectionJsonData[] = [];
        for (let col of res) {
            let pCollection = new PortalCollection(col);
            pCollection.manageable = true;
            portalCols.push(pCollection.toJson());
        }
        return {status: true, content: portalCols}

    } catch {
        return {status: false, content: SERVER_ERROR_MESSAGE}
    }
}


export async function getPublicCollectionList(): Promise<ActionResponse> {
    try {

        let resp = await fetch((process.env.GATEWAY_BASE_URL! as string) + "/collections/", {
            headers: await getHttpHeaderForGateway(),
            cache: "no-store",
        });
        if (!resp.ok) {
            return {status: false, content: REQUEST_FAILED_MESSAGE}
        }
        let res: Collection[] = await resp.json();
        let portalCols: PortalCollectionJsonData[] = [];
        for (let col of res) {
            let pCollection = new PortalCollection(col);
            portalCols.push(pCollection.toJson());
        }
        return {status: true, content: portalCols}

    } catch {
        return {status: false, content: SERVER_ERROR_MESSAGE}
    }
}


export async function createCollection(collection: PortalCollectionJsonData, creatorIdentity: string): Promise<ActionResponse> {
    try {
        const token = await getUserToken();
        if (!token) {
            return {status: false, content: ACTION_NOT_ALLOWED_MESSAGE}
        }

        let newCollection = PortalCollection.toObject(collection);

        if (!newCollection.label || !newCollection.description) {
            return {status: false, content: MANDATORY_FIELDS_MISSING_MESSAGE};
        }
        const identities = await loadCollectionCreatorIdentities(token);
        if (!identities?.some(({ id }) => id === creatorIdentity)) {
            return {status: false, content: ACTION_NOT_ALLOWED_MESSAGE};
        }

        let terminologiesData: Terminology[] = [];
        for (let t of newCollection.terminologies) {
            terminologiesData.push({
                label: t.label,
                source: t.source,
                uri: t.uri,
                type: t.type
            });
        }

        let formData: Collection = {
            label: newCollection.label,
            creator: creatorIdentity,
            description: newCollection.description,
            isPublic: newCollection.isPublic,
            terminologies: terminologiesData,
            collaborators: newCollection.collaborators
        };

        let resp = await fetch((process.env.GATEWAY_BASE_URL! as string) + "/users/collections/", {
            method: "POST",
            headers: await getHttpHeaderForGateway(token),
            body: JSON.stringify(formData)
        });
        if (!resp.ok) {
            let errorBody: unknown;
            try {
                errorBody = await resp.json();
            } catch {
                errorBody = {};
            }
            const error = typeof errorBody === "object" && errorBody !== null
                ? errorBody as Record<string, unknown>
                : {};
            return {
                status: false,
                content: {
                    status: resp.status,
                    statusText: resp.statusText,
                    error: typeof error.error === "string" ? error.error : REQUEST_FAILED_MESSAGE,
                    message: typeof error.message === "string" ? error.message : undefined,
                    path: typeof error.path === "string" ? error.path : undefined
                }
            }
        }
        let res: Collection = await resp.json();
        scheduleCollectionStatistics(res.id);
        return {status: true, content: new PortalCollection(res).toJson()}

    } catch {
        return {status: false, content: SERVER_ERROR_MESSAGE}
    }
}


export async function updateCollection(collection: PortalCollectionJsonData): Promise<ActionResponse> {
    try {
        let token = await getUserToken();
        if (!token) {
            return {status: false, content: ACTION_NOT_ALLOWED_MESSAGE}
        }

        let editedCollection = PortalCollection.toObject(collection);
        if (!editedCollection.label || !editedCollection.description) {
            return {status: false, content: MANDATORY_FIELDS_MISSING_MESSAGE};
        }

        let terminologiesData: Terminology[] = [];
        for (let t of editedCollection.terminologies) {
            terminologiesData.push({
                label: t.label,
                source: t.source,
                uri: t.uri,
                type: t.type
            });
        }

        let formData: Collection = {
            id: editedCollection.id,
            label: editedCollection.label,
            description: editedCollection.description,
            isPublic: editedCollection.isPublic,
            terminologies: terminologiesData,
            collaborators: editedCollection.collaborators
        };


        let resp = await fetch((process.env.GATEWAY_BASE_URL! as string) + "/users/collections/" + formData.id, {
            method: "PUT",
            headers: await getHttpHeaderForGateway(token),
            body: JSON.stringify(formData)
        });


        if (!resp.ok) {
            return {status: false, content: REQUEST_FAILED_MESSAGE}
        }
        let res: Collection = await resp.json();
        scheduleCollectionStatistics(res.id);
        return {status: true, content: new PortalCollection(res).toJson()}

    } catch {
        return {status: false, content: SERVER_ERROR_MESSAGE}
    }
}


export async function deleteCollection(collectionId: string): Promise<ActionResponse> {
    try {
        let token = await getUserToken();
        if (!token) {
            return {status: false, content: ACTION_NOT_ALLOWED_MESSAGE}
        }
        if (!collectionId) {
            return {status: false, content: MANDATORY_FIELDS_MISSING_MESSAGE};
        }

        let resp = await fetch((process.env.GATEWAY_BASE_URL! as string) + "/users/collections/" + collectionId, {
            method: "DELETE",
            headers: await getHttpHeaderForGateway(token),
        });
        if (!resp.ok) {
            return {status: false, content: REQUEST_FAILED_MESSAGE}
        }
        return {status: true, content: "deleted"}


    } catch {
        return {status: false, content: SERVER_ERROR_MESSAGE}
    }
}
