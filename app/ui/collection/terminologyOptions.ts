import { PortalOntologyOption } from "@/app/concepts";

export function getTerminologyOptionKey(option: PortalOntologyOption) {
  return `${option.providerId}:${option.ontologyId}:${option.uri}`;
}

export function filterTerminologyOptions(options: PortalOntologyOption[], search: string, providers: string[] = []) {
  const query = search.trim().toLowerCase();
  if (!query) {
    return [];
  }
  return options.filter((option) =>
    (providers.length === 0 || providers.includes(option.providerId)) &&
    `${option.ontologyId} ${option.providerId} ${option.description}`.toLowerCase().includes(query),
  );
}

export function filterOptionsByProviders(options: PortalOntologyOption[], providers: string[]) {
  return options.filter((option) => providers.includes(option.providerId));
}
