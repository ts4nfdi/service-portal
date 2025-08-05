import {getHttpHeaderForGateway} from "@/app/libs/server_utils";
import {Database} from "@/app/api/actions/types";

export async function getAllDatabases(): Promise<Database[]> {
    try {
        let resp = await fetch((process.env.GATEWAY_BASE_URL! as string) + "/config/databases", {
            headers: await getHttpHeaderForGateway()
        });
        if (!resp.ok) {
            return [];
        }
        let databases = await resp.json();
        return databases;
    } catch {
        return [];
    }
}