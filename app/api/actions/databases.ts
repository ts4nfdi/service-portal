'use server';

import { getHttpHeaderForGateway } from "@/app/libs/server_utils";
import { Database, DatabaseJson } from "@/app/api/actions/types";
import { PortalDatabase, PortalDatabaseJsonData } from "@/app/concepts";
import DatabaseJsonMetadata from "../../databases/databases.json";

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
    let extraMetadata = (DatabaseJsonMetadata as unknown) as DatabaseJson;
    for (let db of databases) {
      let pdb = new PortalDatabase(db);
      let registry = extraMetadata[pdb.name];
      pdb.description = registry.description;
      pdb.contactUrl = registry.contactUrl;
      pdb.title = registry.title;
      pdb.logo = registry.logo;
      pdb.logo_background_color = registry.logo_background_color;
      pdb.homePage = registry.homepage;
      pdb.logoW = registry.logoW;
      pdb.logoH = registry.logoH;
      portalDatabases.push(pdb.toJson());
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