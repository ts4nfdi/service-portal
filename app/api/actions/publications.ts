'use server';

import { ZenodoPublication, PublicationActionResp } from "./types";
import { PortalPublication } from "@/app/concepts";


export async function fetchPublications(page: number, size: number): Promise<PublicationActionResp> {
  try {
    type ZenodoResp = {
      hits: { hits: ZenodoPublication[], total: number }
    }
    let url = `https://zenodo.org/api/records?communities=ts4nfdi&sort=publication-desc&size=${size}&page=${page}`;
    let publicationsApi = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "TS4NFDI-Service-Portal/1.0 (+https://github.com/ts4nfdi/service-portal)"
      }
    });
    if (!publicationsApi.ok) {
      return { failed: true };
    }
    let publicationsApiJson = await publicationsApi.json() as ZenodoResp;
    let zenodoPublications = publicationsApiJson["hits"]["hits"];
    let pubs = [];
    for (let zp of zenodoPublications) {
      pubs.push(new PortalPublication(zp).toJson());
    }
    return { publications: pubs, total: publicationsApiJson["hits"]["total"]};
  } catch {
    return { failed: true };
  }
}
