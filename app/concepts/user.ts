import { normalizeOrcidId } from "./orcid";

export type PortalUser = {
  username: string;
  orcid: string;
};

export function toPortalUser(user: { username?: string; orcid?: string }): PortalUser {
  return { username: user.username ?? "", orcid: normalizeOrcidId(user.orcid ?? "") ?? user.orcid ?? "" };
}
