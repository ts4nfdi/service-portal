'use server';

import { getHttpHeaderForGateway } from "@/app/libs/server_utils";
import { Source, SourcesJson } from "@/app/api/actions/types";
import {PortalProvider, PortalSourcesJsonData} from "@/app/concepts";
import SourcesJsonMetadata from "../../provider/provider.json";

export async function getAllProviders(): Promise<PortalSourcesJsonData[]> {
  try {
    let resp = await fetch((process.env.GATEWAY_BASE_URL! as string) + "/config/databases", {
      headers: await getHttpHeaderForGateway()
    });
    if (!resp.ok) {
      return [];
    }
    let sources: Source[] = await resp.json();
    let portalSources = [];
    let extraMetadata = (SourcesJsonMetadata as unknown) as SourcesJson;
    for (let source of sources) {
      let pdb = new PortalProvider(source);
      let registry = extraMetadata[pdb.name];
      pdb.description = registry.description;
      pdb.contactUrl = registry.contactUrl;
      pdb.title = registry.title;
      pdb.logo = registry.logo;
      pdb.logo_background_color = registry.logo_background_color;
      pdb.homePage = registry.homepage;
      pdb.logoW = registry.logoW;
      pdb.logoH = registry.logoH;
      portalSources.push(pdb.toJson());
    }
    return portalSources;
  } catch {
    return [];
  }
}


export async function getSourcesListOfTerminologies(dbName: string): Promise<{ label: string, iri: string }[]> {
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
