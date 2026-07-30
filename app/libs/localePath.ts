import type { Locale } from "../i18n";

export function localizePath(href: string, locale: Locale) {
  if (
    locale !== "de" ||
    href.startsWith("http") ||
    href.startsWith("/de") ||
    href.startsWith("/api/") ||
    href.startsWith("#")
  ) {
    return href;
  }
  return href.startsWith("/") ? `/de${href}` : `/de/${href}`;
}
