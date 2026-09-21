'use client'

import { PortalOntologyOption } from "@/app/concepts";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { getTerminologyOptionKey } from "@/app/ui/collection/terminologyOptions";

type TerminologyTableProps = {
  options: PortalOntologyOption[];
  searchPlaceholder: string;
  terminologyIdLabel: string;
  providerLabel: string;
  descriptionLabel: string;
  previousPageLabel: string;
  nextPageLabel: string;
  pageLabel: string;
  noResults: string;
  editMode?: boolean;
  showSearch?: boolean;
  selected?: PortalOntologyOption[];
  selectAllLabel?: string;
  selectedCountLabel?: string;
  providerDescriptions?: Record<string, string>;
  providerFilterLabel?: string;
  allProvidersLabel?: string;
  additionalProvidersLabel?: string;
  clearProvidersLabel?: string;
  onChange?: (options: PortalOntologyOption[]) => void;
  renderTerminology?: (option: PortalOntologyOption) => ReactNode;
}

export default function TerminologyTable({
  options,
  selected = [],
  searchPlaceholder,
  selectAllLabel,
  terminologyIdLabel,
  providerLabel,
  descriptionLabel,
  selectedCountLabel,
  previousPageLabel,
  nextPageLabel,
  pageLabel,
  noResults,
  editMode = false,
  showSearch = true,
  onChange,
  renderTerminology,
  providerDescriptions,
  providerFilterLabel,
  allProvidersLabel,
  additionalProvidersLabel,
  clearProvidersLabel,
}: TerminologyTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const providerDropdownRef = useRef<HTMLDivElement>(null);
  const providerButtonRef = useRef<HTMLButtonElement>(null);
  const selectable = editMode;
  const selectedKeys = useMemo(() => new Set(selected.map(getTerminologyOptionKey)), [selected]);
  const providers = useMemo(() =>
    [...new Set(options.map((option) => option.providerId))].filter(Boolean).sort(),
  [options]);
  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return options.filter((option) =>
      (selectedProviders.length === 0 || selectedProviders.includes(option.providerId)) &&
      (!query || `${option.ontologyId} ${option.providerId} ${option.description}`.toLowerCase().includes(query)),
    );
  }, [options, search, selectedProviders]);
  const allFilteredSelected = filteredOptions.length > 0 && filteredOptions.every((option) => selectedKeys.has(getTerminologyOptionKey(option)));
  const pageCount = Math.max(1, Math.ceil(filteredOptions.length / 100));
  const visibleOptions = filteredOptions.slice(page * 100, (page + 1) * 100);
  const showProviderFilter = selectable && Boolean(providerFilterLabel && allProvidersLabel && additionalProvidersLabel && clearProvidersLabel);
  const providerSummary = selectedProviders.length === 0
    ? allProvidersLabel
    : selectedProviders.length === 1
      ? selectedProviders[0]
      : additionalProvidersLabel
        ?.replace("{provider}", selectedProviders[0])
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

  function toggle(option: PortalOntologyOption) {
    const key = getTerminologyOptionKey(option);
    onChange?.(selectedKeys.has(key)
      ? selected.filter((item) => getTerminologyOptionKey(item) !== key)
      : [...selected, option]);
  }

  function toggleFiltered() {
    const filteredKeys = new Set(filteredOptions.map(getTerminologyOptionKey));
    onChange?.(allFilteredSelected
      ? selected.filter((option) => !filteredKeys.has(getTerminologyOptionKey(option)))
      : [...selected, ...filteredOptions.filter((option) => !selectedKeys.has(getTerminologyOptionKey(option)))]);
  }

  function toggleProvider(provider: string) {
    setSelectedProviders((current) => current.includes(provider)
      ? current.filter((item) => item !== provider)
      : [...current, provider]);
    setPage(0);
  }

  return (
    <div>
      {showSearch && <div className={showProviderFilter ? "grid gap-3 md:grid-cols-[minmax(12rem,1fr)_3fr]" : ""}>
        {showProviderFilter &&
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
              <div id="provider-filter-options" className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-700">
                {selectedProviders.length > 0 &&
                  <button type="button" className="mb-1 w-full rounded p-2 text-left text-sm font-medium text-ts4nfdi-brand-color hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600" onClick={() => { setSelectedProviders([]); setPage(0); }}>
                    {clearProvidersLabel}
                  </button>
                }
                {providers.map((provider) =>
                  <label key={provider} className="flex cursor-pointer items-start gap-2 rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <input type="checkbox" checked={selectedProviders.includes(provider)} onChange={() => toggleProvider(provider)} className="mt-1 h-4 w-4 rounded border-gray-300 text-ts4nfdi-brand-color focus:ring-ts4nfdi-brand-color dark:border-gray-500 dark:bg-gray-600" />
                    <span>
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">{provider}</span>
                      {providerDescriptions?.[provider] && <span className="mt-0.5 block text-xs text-gray-600 dark:text-gray-300">{providerDescriptions[provider]}</span>}
                    </span>
                  </label>
                )}
              </div>
            }
          </div>
        }
        <div>
          <input
            id="terminology-table-search"
            type="search"
            aria-label={searchPlaceholder}
            className={`${showProviderFilter ? "mt-7 " : ""}w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 placeholder:text-gray-500 focus:border-ts4nfdi-brand-color focus:ring-ts4nfdi-brand-color dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-400`}
            value={search}
            placeholder={searchPlaceholder}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />
        </div>
      </div>}
      {selectable && selectedCountLabel &&
        <p className="my-3 text-sm text-gray-600 dark:text-gray-300">
          {selectedCountLabel
            .replace("{selected}", selected.length.toString())
            .replace("{total}", options.length.toString())}
        </p>
      }
      <div className={`${selectable ? "" : "mt-3 "}max-h-[32rem] overflow-auto rounded-lg border border-gray-200 dark:border-gray-600`}>
        <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
          <thead className="sticky top-0 bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-200">
            <tr>
              {selectable &&
                <th scope="col" className="w-12 p-3">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleFiltered}
                    aria-label={selectAllLabel}
                    className="h-4 w-4 rounded border-gray-300 text-ts4nfdi-brand-color focus:ring-ts4nfdi-brand-color dark:border-gray-500 dark:bg-gray-600"
                  />
                </th>
              }
              <th scope="col" className="p-3">{terminologyIdLabel}</th>
              <th scope="col" className="p-3">{providerLabel}</th>
              <th scope="col" className="p-3">{descriptionLabel}</th>
            </tr>
          </thead>
          <tbody>
            {visibleOptions.map((option) =>
              <tr key={getTerminologyOptionKey(option)} className="border-t border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                {selectable &&
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedKeys.has(getTerminologyOptionKey(option))}
                      onChange={() => toggle(option)}
                      aria-label={`${option.ontologyId} (${option.providerId})`}
                      className="h-4 w-4 rounded border-gray-300 text-ts4nfdi-brand-color focus:ring-ts4nfdi-brand-color dark:border-gray-500 dark:bg-gray-600"
                    />
                  </td>
                }
                <th scope="row" className="p-3 font-medium text-gray-900 dark:text-white">
                  {renderTerminology?.(option) ?? option.ontologyId}
                </th>
                <td className="p-3">{option.providerId}</td>
                <td className="p-3">{option.description || "—"}</td>
              </tr>
            )}
            {filteredOptions.length === 0 &&
              <tr className="bg-white dark:bg-gray-800">
                <td colSpan={selectable ? 4 : 3} className="p-4 text-center">{noResults}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      {pageCount > 1 &&
        <nav className="mt-3 flex items-center justify-end gap-3" aria-label={pageLabel.replace("{current}", (page + 1).toString()).replace("{total}", pageCount.toString())}>
          <button
            type="button"
            className="btn !px-3 !py-1 !text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page === 0}
            onClick={() => setPage((current) => current - 1)}
          >
            {previousPageLabel}
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {pageLabel.replace("{current}", (page + 1).toString()).replace("{total}", pageCount.toString())}
          </span>
          <button
            type="button"
            className="btn !px-3 !py-1 !text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page + 1 >= pageCount}
            onClick={() => setPage((current) => current + 1)}
          >
            {nextPageLabel}
          </button>
        </nav>
      }
    </div>
  );
}
