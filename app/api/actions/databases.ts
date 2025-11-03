import { getHttpHeaderForGateway } from "@/app/libs/server_utils";
import { Database } from "@/app/api/actions/types";
import { PortalDatabase, PortalDatabaseJsonData } from "@/app/concepts";

export async function getAllDatabases(): Promise<PortalDatabaseJsonData[]> {
    try {
        let resp = await fetch((process.env.GATEWAY_BASE_URL! as string) + "/config/databases", {
            headers: await getHttpHeaderForGateway()
        });
        if (!resp.ok) {
            return [];
        }
        let databases: Database[] = await resp.json();
        let portalDatabases = [];
        for (let db of databases) {
            portalDatabases.push(new PortalDatabase(db).toJson())
        }
        return portalDatabases;
    } catch {
        return [];
    }
}


export async function getDatabasedListOfTerminologies(dbName: string): Promise<{ label: string, iri: string }[]> {
    try {
        let resp = await fetch((process.env.GATEWAY_BASE_URL! as string) + `/artefacts?database=${dbName}&showResponseConfiguration=false`, {
            headers: await getHttpHeaderForGateway()
        })
        console.log(resp.url)
        let dbAndTerminologies = await resp.json();
        let results = [];
        for (let terminology of dbAndTerminologies) {
            results.push({ label: terminology["short_form"], iri: terminology["iri"] });
        }
        return results;
    } catch {
        return [];
    }
}