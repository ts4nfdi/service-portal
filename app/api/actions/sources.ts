'use server';

import { getHttpHeaderForGateway } from "@/app/libs/server_utils";
import { Source, SourceJson } from "@/app/api/actions/types";
import { PortalSource, PortalSourcesJsonData } from "@/app/concepts";
import SourceJsonMetadata from "@/app/sources/sources.json";

export async function getAllSources(): Promise<PortalSourcesJsonData[]> {
    try {
        let resp = await fetch((process.env.GATEWAY_BASE_URL! as string) + "/config/sources", {
            headers: await getHttpHeaderForGateway()
        });
        if (!resp.ok) {
            return [];
        }
        let sources: Source[] = await resp.json();
        let portalSources = [];
        let extraMetadata = (SourceJsonMetadata as unknown) as SourceJson;
        for (let sc of sources) {
            let psc = new PortalSource(sc);
            let registry = extraMetadata[psc.name];
            psc.description = registry.description;
            psc.contactUrl = registry.contactUrl;
            psc.title = registry.title;
            psc.logo = registry.logo;
            psc.logo_background_color = registry.logo_background_color;
            psc.homePage = registry.homepage;
            psc.logoW = registry.logoW;
            psc.logoH = registry.logoH;
            portalSources.push(psc.toJson());
        }
        return portalSources;
    } catch {
        return [];
    }
}


export async function getSourceListOfTerminologies(scName: string): Promise<{ label: string, iri: string }[]> {
    try {
        let resp = await fetch((process.env.GATEWAY_BASE_URL! as string) + `/artefacts?source=${scName}&showResponseConfiguration=false`, {
            headers: await getHttpHeaderForGateway()
        })
        let scAndTerminologies = await resp.json();
        let results = [];
        for (let terminology of scAndTerminologies) {
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