'use client'

import { PortalOntologyOption } from "@/app/concepts";
import { useEffect, useMemo, useRef, useState } from "react";
import { filterTerminologyOptions, getTerminologyOptionKey } from "@/app/ui/collection/terminologyOptions";

type TerminologyMultiSelectProps = {
  label: string;
  options: PortalOntologyOption[];
  selected: PortalOntologyOption[];
  providerDescriptions: Record<string, string>;
  searchPlaceholder: string;
  providerFilterLabel: string;
  allProvidersLabel: string;
  additionalProvidersLabel: string;
  clearProvidersLabel: string;
  noResults: string;
  limitedResults: string;
  removeLabel: string;
  showSelected?: boolean;
  onChange: (selected: PortalOntologyOption[]) => void;
}

export default function TerminologyMultiSelect({
  label,
  options,
  selected,
  providerDescriptions,
  searchPlaceholder,
  providerFilterLabel,
  allProvidersLabel,
  additionalProvidersLabel,
  clearProvidersLabel,
  noResults,
  limitedResults,
  removeLabel,
  showSelected = true,
  onChange,
}: TerminologyMultiSelectProps) {
  const [search, setSearch] = useState("");
  const [terminologyDropdownOpen, setTerminologyDropdownOpen] = useState(false);
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const providerDropdownRef = useRef<HTMLDivElement>(null);
  const providerButtonRef = useRef<HTMLButtonElement>(null);
  const terminologySearchRef = useRef<HTMLDivElement>(null);
  const terminologyResultsRef = useRef<HTMLUListElement>(null);
  const selectedKeys = useMemo(() => new Set(selected.map(getTerminologyOptionKey)), [selected]);
  const providers = useMemo(() =>
    [...new Set(options.map((option) => option.providerId))].filter(Boolean).sort(),
  [options]);
  const filteredOptions = useMemo(() => filterTerminologyOptions(options, search, selectedProviders), [options, search, selectedProviders]);
  const visibleOptions = filteredOptions.slice(0, 100);
  const providerSummary = selectedProviders.length === 0
    ? allProvidersLabel
    : selectedProviders.length === 1
      ? selectedProviders[0]
      : additionalProvidersLabel
        .replace("{provider}", selectedProviders[0])
        .replace("{count}", (selectedProviders.length - 1).toString());

  useEffect(() => {
    if (!providerDropdownOpen) {
      return;
    }
    function closeDropdown(event: PointerEvent | KeyboardEvent) {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") {
          setProviderDropdownOpen(false);
          providerButtonRef.current?.focus();
        }
        return;
      }
      if (!providerDropdownRef.current?.contains(event.target as Node)) {
        setProviderDropdownOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeDropdown);
    document.addEventListener("keydown", closeDropdown);
    return () => {
      document.removeEventListener("pointerdown", closeDropdown);
      document.removeEventListener("keydown", closeDropdown);
    };
  }, [providerDropdownOpen]);

  useEffect(() => {
    if (!terminologyDropdownOpen) {
      return;
    }
    function closeDropdown(event: PointerEvent) {
      const target = event.target as Node;
      if (!terminologySearchRef.current?.contains(target) && !terminologyResultsRef.current?.contains(target)) {
        setTerminologyDropdownOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeDropdown);
    return () => document.removeEventListener("pointerdown", closeDropdown);
  }, [terminologyDropdownOpen]);

  function toggle(option: PortalOntologyOption) {
    const key = getTerminologyOptionKey(option);
    onChange(selectedKeys.has(key)
      ? selected.filter((item) => getTerminologyOptionKey(item) !== key)
      : [...selected, option]);
  }

  function toggleProvider(provider: string) {
    setSelectedProviders((selected) => selected.includes(provider)
      ? selected.filter((item) => item !== provider)
      : [...selected, provider]);
  }

  return (
    <div>
      {showSelected && selected.length > 0 &&
        <div className="mb-3 flex flex-wrap gap-2">
          {selected.map((option) =>
            <button
              type="button"
              key={getTerminologyOptionKey(option)}
              className="rounded bg-ts4nfdi-brand-color px-2 py-1 text-sm text-white dark:bg-ts4nfdi-brand-color"
              aria-label={`${removeLabel} ${option.ontologyId} (${option.providerId})`}
              onClick={() => toggle(option)}
            >
              {option.ontologyId}({option.providerId}) ×
            </button>
          )}
        </div>
      }
      <div className="grid gap-3 md:grid-cols-[minmax(12rem,1fr)_3fr]">
        <div className="relative" ref={providerDropdownRef}>
          <span id="provider-filter-label" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            {providerFilterLabel}
          </span>
          <button
            ref={providerButtonRef}
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-2 text-left text-sm text-gray-900 focus:border-ts4nfdi-brand-color focus:outline-none focus:ring-2 focus:ring-ts4nfdi-brand-color/30 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            aria-labelledby="provider-filter-label provider-filter-button"
            aria-expanded={providerDropdownOpen}
            aria-controls="provider-filter-options"
            id="provider-filter-button"
            onClick={() => setProviderDropdownOpen((open) => !open)}
          >
            <span className="truncate">{providerSummary}</span>
            <span aria-hidden="true">▾</span>
          </button>
          {providerDropdownOpen &&
            <div
              id="provider-filter-options"
              className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-700"
            >
              {selectedProviders.length > 0 &&
                <button
                  type="button"
                  className="mb-1 w-full rounded p-2 text-left text-sm font-medium text-ts4nfdi-brand-color hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                  onClick={() => setSelectedProviders([])}
                >
                  {clearProvidersLabel}
                </button>
              }
              {providers.map((provider) =>
                <label key={provider} className="flex cursor-pointer items-start gap-2 rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                  <input
                    type="checkbox"
                    checked={selectedProviders.includes(provider)}
                    onChange={() => toggleProvider(provider)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-ts4nfdi-brand-color focus:ring-ts4nfdi-brand-color dark:border-gray-500 dark:bg-gray-600"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">{provider}</span>
                    {providerDescriptions[provider] &&
                      <span className="mt-0.5 block text-xs text-gray-600 dark:text-gray-300">
                        {providerDescriptions[provider]}
                      </span>
                    }
                  </span>
                </label>
              )}
            </div>
          }
        </div>
        <div ref={terminologySearchRef}>
          <label htmlFor="terminology-search" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </label>
          <input
            id="terminology-search"
            type="text"
            value={search}
            placeholder={searchPlaceholder}
            aria-expanded={terminologyDropdownOpen}
            aria-controls="terminology-search-results"
            onFocus={() => setTerminologyDropdownOpen(Boolean(search.trim()))}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setTerminologyDropdownOpen(false);
              }
            }}
            onChange={(event) => {
              setSearch(event.target.value);
              setTerminologyDropdownOpen(Boolean(event.target.value.trim()));
            }}
          />
        </div>
      </div>
      {terminologyDropdownOpen && search.trim() && <ul
        id="terminology-search-results"
        ref={terminologyResultsRef}
        className="mt-2 max-h-96 w-full !list-none overflow-y-auto rounded-lg border border-gray-200 bg-white !px-0 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        {filteredOptions.length > visibleOptions.length &&
          <li className="p-3 text-sm text-gray-600 dark:text-gray-300">
            {limitedResults
              .replace("{count}", visibleOptions.length.toString())
              .replace("{total}", filteredOptions.length.toString())}
          </li>
        }
        {filteredOptions.length === 0 && <li className="p-3 text-sm">{noResults}</li>}
        {visibleOptions.map((option) => {
          const key = getTerminologyOptionKey(option);
          return (
            <li key={key} className="border-b border-gray-200 last:border-b-0 dark:border-gray-600">
              <label className="flex cursor-pointer gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-600">
                <input
                  type="checkbox"
                  checked={selectedKeys.has(key)}
                  onChange={() => toggle(option)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-ts4nfdi-brand-color focus:ring-ts4nfdi-brand-color dark:border-gray-500 dark:bg-gray-600"
                />
                <span>
                  <span className="block font-medium">{option.ontologyId}({option.providerId})</span>
                  {option.description && <span className="mt-1 block text-sm text-gray-600 dark:text-gray-300">{option.description}</span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>}
    </div>
  );
}
