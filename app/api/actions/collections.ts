'use server'

import {ActionResponse, Collection} from "./types";
import {getUserToken} from "@/app/libs/auth";
import {getHttpHeaderForGateway} from "@/app/libs/server_utils";
import {
    ACTION_NOT_ALLOWED_MESSAGE,
    REQUEST_FAILED_MESSAGE,
    SERVER_ERROR_MESSAGE,
    MANDATORY_FIELDS_MISSING_MESSAGE
} from "@/app/libs/responseStrings";


export async function getUserCollectionList(): Promise<ActionResponse> {
    try {
        let token = await getUserToken();
        if (!token) {
            return {status: false, content: ACTION_NOT_ALLOWED_MESSAGE}
        }
        let resp = await fetch((process.env.GATEWAY_BASE_URL! as string) + "/users/collections/", {
            headers: await getHttpHeaderForGateway(token)
        });
        if (!resp.ok) {
            return {status: false, content: REQUEST_FAILED_MESSAGE}
        }
        let res: Collection[] = await resp.json();
        return {status: true, content: res}

    } catch {
        return {status: false, content: SERVER_ERROR_MESSAGE}
    }
}


export async function createCollection(formData: Collection): Promise<ActionResponse> {
    try {
        let token = await getUserToken();
        if (!token) {
            return {status: false, content: ACTION_NOT_ALLOWED_MESSAGE}
        }

        if (!formData.label || !formData.description || !formData.terminologies || formData.terminologies.length === 0) {
            return {status: false, content: MANDATORY_FIELDS_MISSING_MESSAGE};
        }

        let resp = await fetch((process.env.GATEWAY_BASE_URL! as string) + "/users/collections/", {
            method: "POST",
            headers: await getHttpHeaderForGateway(token),
            body: JSON.stringify(formData)
        });
        if (!resp.ok) {
            return {status: false, content: REQUEST_FAILED_MESSAGE}
        }
        let res: Collection = await resp.json();
        return {status: true, content: res}

    } catch {
        return {status: false, content: SERVER_ERROR_MESSAGE}
    }
}


export async function editCollection(formData: Collection): Promise<ActionResponse> {
    try {
        let token = await getUserToken();
        if (!token) {
            return {status: false, content: ACTION_NOT_ALLOWED_MESSAGE}
        }
        if (!formData.label || !formData.description || !formData.terminologies || formData.terminologies.length === 0) {
            return {status: false, content: MANDATORY_FIELDS_MISSING_MESSAGE};
        }

        let resp = await fetch((process.env.GATEWAY_BASE_URL! as string) + "/users/collections/" + formData.id, {
            method: "PUT",
            headers: await getHttpHeaderForGateway(token),
            body: JSON.stringify(formData)
        });

        if (!resp.ok) {
            return {status: false, content: REQUEST_FAILED_MESSAGE}
        }
        let res: Collection = await resp.json();
        return {status: true, content: res}

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
