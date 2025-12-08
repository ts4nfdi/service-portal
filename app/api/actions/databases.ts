'use server';

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
    let registries = await getListOfRegistriesFromBartoc();
    let databases: Database[] = await resp.json();
    let portalDatabases = [];
    for (let db of databases) {
      let pdb = new PortalDatabase(db);
      registries.forEach((registry) => {
        let regUrls = registry.url + "+++" + (registry["API"][0].url ?? "");
        let dbUrl = pdb.url.replace("https://", "");
        dbUrl = dbUrl.replace("http://", "");
        dbUrl = dbUrl.replace("www.", "");
        dbUrl = dbUrl.split("/")[0];
        if (regUrls.includes(dbUrl)) {
          pdb.description = registry.definition;
          pdb.contactUrl = registry.contactUrl;
          pdb.title = registry.prefLabel;
          pdb.bartocUrl = registry.uri;
        }
      });
      portalDatabases.push(pdb.toJson())
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


export async function getListOfRegistriesFromBartoc(): Promise<any[]> {
  try {
    let resp = await fetch("https://raw.githubusercontent.com/gbv/bartoc.org/main/data/registries.ndjson")
    if (!resp.ok) {
      return [];
    }
    let registriesText = await resp.text();
    let registries = [];
    for (let line of registriesText.split("\n")) {
      let registry = JSON.parse(line);
      if ("API" in registry) {
        registries.push(registry);
      }
    }
    return registries;

  } catch {
    return [];
  }
}