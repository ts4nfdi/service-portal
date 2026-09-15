'use client'

import { PortalOntologyOption } from "@/app/concepts";
import { useMemo, useState } from "react";

type BulkTerminologyTableProps = {
  options: PortalOntologyOption[];
  selected: PortalOntologyOption[];
  searchLabel: string;
  searchPlaceholder: string;
  selectAllLabel: string;
  terminologyIdLabel: string;
  providerLabel: string;
  descriptionLabel: string;
  selectedCountLabel: string;
  previousPageLabel: string;
  nextPageLabel: string;
  pageLabel: string;
  noResults: string;
  onChange: (options: PortalOntologyOption[]) => void;
}

function optionKey(option: PortalOntologyOption) {
  return `${option.providerId}:${option.ontologyId}:${option.uri}`;
}

export default function BulkTerminologyTable({
  options,
  selected,
  searchLabel,
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
  onChange,
}: BulkTerminologyTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const selectedKeys = useMemo(() => new Set(selected.map(optionKey)), [selected]);
  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? options.filter((option) => `${option.ontologyId} ${option.providerId} ${option.description}`.toLowerCase().includes(query))
      : options;
  }, [options, search]);
  const allFilteredSelected = filteredOptions.length > 0 && filteredOptions.every((option) => selectedKeys.has(optionKey(option)));
  const pageCount = Math.max(1, Math.ceil(filteredOptions.length / 100));
  const visibleOptions = filteredOptions.slice(page * 100, (page + 1) * 100);

  function toggle(option: PortalOntologyOption) {
    const key = optionKey(option);
    onChange(selectedKeys.has(key)
      ? selected.filter((item) => optionKey(item) !== key)
      : [...selected, option]);
  }

  function toggleFiltered() {
    const filteredKeys = new Set(filteredOptions.map(optionKey));
    onChange(allFilteredSelected
      ? selected.filter((option) => !filteredKeys.has(optionKey(option)))
      : [...selected, ...filteredOptions.filter((option) => !selectedKeys.has(optionKey(option)))]);
  }

  return (
    <div>
      <label htmlFor="bulk-terminology-search" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        {searchLabel}
      </label>
      <input
        id="bulk-terminology-search"
        type="search"
        value={search}
        placeholder={searchPlaceholder}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(0);
        }}
      />
      <p className="my-3 text-sm text-gray-600 dark:text-gray-300">
        {selectedCountLabel
          .replace("{selected}", selected.length.toString())
          .replace("{total}", options.length.toString())}
      </p>
      <div className="max-h-[32rem] overflow-auto rounded-lg border border-gray-200 dark:border-gray-600">
        <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
          <thead className="sticky top-0 bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-200">
            <tr>
              <th scope="col" className="w-12 p-3">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleFiltered}
                  aria-label={selectAllLabel}
                  className="h-4 w-4 rounded border-gray-300 text-ts4nfdi-brand-color focus:ring-ts4nfdi-brand-color dark:border-gray-500 dark:bg-gray-600"
                />
              </th>
              <th scope="col" className="p-3">{terminologyIdLabel}</th>
              <th scope="col" className="p-3">{providerLabel}</th>
              <th scope="col" className="p-3">{descriptionLabel}</th>
            </tr>
          </thead>
          <tbody>
            {visibleOptions.map((option) =>
              <tr key={optionKey(option)} className="border-t border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedKeys.has(optionKey(option))}
                    onChange={() => toggle(option)}
                    aria-label={`${option.ontologyId} (${option.providerId})`}
                    className="h-4 w-4 rounded border-gray-300 text-ts4nfdi-brand-color focus:ring-ts4nfdi-brand-color dark:border-gray-500 dark:bg-gray-600"
                  />
                </td>
                <th scope="row" className="p-3 font-medium text-gray-900 dark:text-white">{option.ontologyId}</th>
                <td className="p-3">{option.providerId}</td>
                <td className="p-3">{option.description || "—"}</td>
              </tr>
            )}
            {filteredOptions.length === 0 &&
              <tr className="bg-white dark:bg-gray-800">
                <td colSpan={4} className="p-4 text-center">{noResults}</td>
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
