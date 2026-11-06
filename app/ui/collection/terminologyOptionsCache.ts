"use client";

import type { PortalTerminologyOption } from "@/app/concepts";

const cacheKey = "terminology-options-v1";
const cacheLifetime = 24 * 60 * 60 * 1000;
type OptionsCache = { fetchedAt: number; options: PortalTerminologyOption[] };
let cached: OptionsCache | null = null;
let pending: Promise<PortalTerminologyOption[] | null> | null = null;

function isFresh(value: unknown): value is OptionsCache {
  const cache = value as OptionsCache | null;
  return !!cache && typeof cache.fetchedAt === "number"
    && cache.fetchedAt <= Date.now() && Date.now() - cache.fetchedAt < cacheLifetime
    && Array.isArray(cache.options) && cache.options.every((option) => option
      && typeof option.terminologyId === "string" && typeof option.providerId === "string"
      && typeof option.description === "string" && typeof option.uri === "string");
}

export async function getCachedTerminologyOptions(): Promise<PortalTerminologyOption[] | null> {
  if (isFresh(cached)) return cached.options;
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(cacheKey) ?? "null");
    if (isFresh(stored)) {
      cached = stored;
      return stored.options;
    }
  } catch {
    // Continue without persistent caching when browser storage is unavailable.
  }
  if (!pending) {
    pending = fetch("/api/terminology-options", { cache: "no-store" })
      .then((response): Promise<PortalTerminologyOption[] | null> | null => response.ok ? response.json() : null)
      .then((options) => {
        if (options) {
          cached = { fetchedAt: Date.now(), options };
          try {
            localStorage.setItem(cacheKey, JSON.stringify(cached));
          } catch {
            // The in-memory cache remains available if storage is full or disabled.
          }
        }
        return options;
      }).catch(() => null).finally(() => {
        pending = null;
      });
  }
  return pending;
}
