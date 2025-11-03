'use server';

import { ZenodoPublication } from "./types";
import { PortalPublication, PortalPublicationJsonData } from "@/app/concepts";


export async function fetchPublications(): Promise<PortalPublicationJsonData[]> {
  try {
    type ZenodoResp = {
      hits: { hits: ZenodoPublication[] }
    }
    let publicationsApi = await fetch("https://zenodo.org/api/records?communities=ts4nfdi&sort=publication-desc");
    let publicationsApiJson = await publicationsApi.json() as ZenodoResp;
    let zenodoPublications = publicationsApiJson["hits"]["hits"];
    let pubs = [];
    for (let zp of zenodoPublications) {
      pubs.push(new PortalPublication(zp).toJson());
    }
    return pubs;
  } catch {
    return [];
  }
}
