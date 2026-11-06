import { PortalTerminologyOption } from "@/app/concepts";

export function getTerminologyOptionKey(option: PortalTerminologyOption) {
  return `${option.providerId}:${option.terminologyId}:${option.uri}`;
}

export function filterTerminologyOptions(options: PortalTerminologyOption[], search: string, providers: string[] = []) {
  const query = search.trim().toLowerCase();
  if (!query) {
    return [];
  }
  return options.filter((option) =>
    (providers.length === 0 || providers.includes(option.providerId)) &&
    `${option.terminologyId} ${option.providerId} ${option.description}`.toLowerCase().includes(query),
  );
}

export function filterOptionsByProviders(options: PortalTerminologyOption[], providers: string[]) {
  return options.filter((option) => providers.includes(option.providerId));
}
