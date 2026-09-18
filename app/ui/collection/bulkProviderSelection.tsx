'use client'

import { PortalOntologyOption } from "@/app/concepts";
import { useMemo } from "react";

type BulkProviderSelectionProps = {
  options: PortalOntologyOption[];
  selected: string[];
  descriptions: Record<string, string>;
  label: string;
  countLabel: string;
  countSingularLabel: string;
  onChange: (providers: string[]) => void;
}

export default function BulkProviderSelection({
  options,
  selected,
  descriptions,
  label,
  countLabel,
  countSingularLabel,
  onChange,
}: BulkProviderSelectionProps) {
  const providers = useMemo(() => {
    const counts = new Map<string, number>();
    options.forEach((option) => counts.set(option.providerId, (counts.get(option.providerId) ?? 0) + 1));
    return [...counts].sort(([first], [second]) => first.localeCompare(second));
  }, [options]);

  return (
    <fieldset>
      <legend className="mb-3 text-base font-medium text-gray-900 dark:text-white">{label}</legend>
      <div className="grid gap-3 md:grid-cols-2">
        {providers.map(([provider, count]) =>
          <label
            key={provider}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${selected.includes(provider)
              ? "border-ts4nfdi-brand-color bg-gray-50 dark:border-ts4nfdi-brand-color dark:bg-gray-700"
              : "border-gray-200 bg-white hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"}`}
          >
            <input
              type="checkbox"
              checked={selected.includes(provider)}
              onChange={() => onChange(selected.includes(provider)
                ? selected.filter((item) => item !== provider)
                : [...selected, provider])}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-ts4nfdi-brand-color focus:ring-ts4nfdi-brand-color dark:border-gray-500 dark:bg-gray-600"
            />
            <span>
              <span className="block font-semibold text-gray-900 dark:text-white">{provider}</span>
              {descriptions[provider] &&
                <span className="mt-1 block text-sm text-gray-600 dark:text-gray-300">{descriptions[provider]}</span>
              }
              <span className="mt-2 block text-sm font-medium text-ts4nfdi-brand-color dark:text-gray-200">
                {(count === 1 ? countSingularLabel : countLabel).replace("{count}", count.toString())}
              </span>
            </span>
          </label>
        )}
      </div>
    </fieldset>
  );
}
