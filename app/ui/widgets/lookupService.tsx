"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { SearchResultsListWidgetProps } from "@ts4nfdi/terminology-service-suite";
import { QueryClient, QueryClientProvider } from "react-query";
import { Loading, WarningAlert } from "@/app/ui/commons/snippets";
import { Modal } from "@/app/ui/commons/modal";
import { useLocale } from "@/app/i18n";
import { widgetMessages } from "@/app/widgets/messages";
import MetadataWidgetTSS from "./MetadataWidget";
import { AutoCompleteSelectedTermType } from "./types";
import "./styles.css";

type SearchResult = {
  iri: string;
  label: string;
  description: string[];
  ontology_name: string;
  type: string;
  short_form: string;
};

const SearchResultsListWidget = dynamic<SearchResultsListWidgetProps>(
  () =>
    import("@ts4nfdi/terminology-service-suite").then(
      (mod) => mod.SearchResultsListWidget,
    ),
  { ssr: false, loading: () => <Loading /> },
) as React.ComponentType<SearchResultsListWidgetProps>;

const fallbackApi = "https://api.terminology.tib.eu/api/";

function configuredApi(): string | undefined {
  const endpoint = process.env.NEXT_PUBLIC_API_GATEWAY_ENDPOINT;
  return endpoint ? `${endpoint.replace(/\/$/, "")}/ols4/api/` : undefined;
}

export default function LookupServiceWidget() {
  const t = widgetMessages[useLocale()];
  const [api, setApi] = useState<string | undefined>(
    configuredApi() ? undefined : fallbackApi,
  );
  const [usingFallback, setUsingFallback] = useState(false);
  const [selectedTerm, setSelectedTerm] =
    useState<AutoCompleteSelectedTermType>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEntitySetFormVisible, setIsEntitySetFormVisible] = useState(false);

  useEffect(() => {
    const primaryApi = configuredApi();
    if (!primaryApi) {
      setUsingFallback(true);
      return;
    }

    const controller = new AbortController();
    let isCurrent = true;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 5000);
    const searchEndpoint = `${primaryApi}search?exact=false&obsoletes=false&q=assay`;

    fetch(searchEndpoint, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("API unavailable");
        setApi(primaryApi);
      })
      .catch(() => {
        if (!isCurrent || (controller.signal.aborted && !timedOut)) return;
        setApi(fallbackApi);
        setUsingFallback(true);
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      isCurrent = false;
      controller.abort();
    };
  }, []);

  const [queryClient] = useState(() => new QueryClient());

  function openTermModal(result: SearchResult) {
    setSelectedTerm({
      iri: result.iri,
      label: result.label,
      ontology_name: result.ontology_name,
      short_form: result.short_form,
      type: result.type,
    });
    setIsEntitySetFormVisible(false);
    setIsModalOpen(true);

    const modal = document.getElementById(
      "lookup-term-modal",
    )! as HTMLDivElement;
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    (modal.previousSibling as HTMLDivElement).classList.remove("hidden");
  }

  return (
    <>
      {usingFallback && <WarningAlert message={t.fallbackWarning} />}
      {!api && <Loading />}
      {api && (
        <QueryClientProvider client={queryClient}>
          <SearchResultsListWidget
            api={api}
            initialItemsPerPage={10}
            itemsPerPageOptions={[10, 25, 50, 100]}
            onNavigateToOntology={() => undefined}
            parameter=""
            preselected={[]}
            query="assay"
            targetLink=""
            className="search-widget"
            useLegacy={false}
            OnNavigateToSearchResult={openTermModal}
          />
        </QueryClientProvider>
      )}
      <Modal
        id="lookup-term-modal"
        title={`${selectedTerm?.ontology_name ?? ""}:${selectedTerm?.label ?? ""}`}
        classNames="max-w-6xl"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        headerAction={
          !isEntitySetFormVisible && (
            <button
              aria-label="Add to Entity set"
              className="btn !ms-3 !me-0 !mb-0 !px-3 !py-1.5 !inline-flex items-center gap-1"
              onClick={() => setIsEntitySetFormVisible(true)}
              title="Add to Entity set"
              type="button"
            >
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 4v16m-8-8h16" strokeLinecap="round" />
              </svg>
              Entity set
            </button>
          )
        }
        content={
          isModalOpen &&
          selectedTerm &&
          (isEntitySetFormVisible ? (
            <div className="space-y-4">
              <button
                className="btn"
                onClick={() => setIsEntitySetFormVisible(false)}
                type="button"
              >
                Back to metadata
              </button>
              <p>
                This is a mockup. Adding terms to an entity set will be
                available soon.
              </p>
              <form
                className="space-y-4"
                onSubmit={(event) => event.preventDefault()}
              >
                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    htmlFor="entity-set-name"
                  >
                    Set name
                  </label>
                  <input
                    className="input w-full"
                    id="entity-set-name"
                    name="name"
                    type="text"
                  />
                </div>
                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    htmlFor="entity-set-description"
                  >
                    Description
                  </label>
                  <textarea
                    className="input w-full"
                    id="entity-set-description"
                    name="description"
                    rows={3}
                  />
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <MetadataWidgetTSS
                api={api}
                selectedTerm={selectedTerm}
                showTitle={false}
              />
            </div>
          ))
        }
        withCloseBtn
      />
    </>
  );
}
