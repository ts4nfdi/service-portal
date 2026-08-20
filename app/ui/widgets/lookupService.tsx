"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { SearchResultsListWidgetProps } from "@ts4nfdi/terminology-service-suite";
import { QueryClient, QueryClientProvider } from "react-query";
import { Loading, WarningAlert } from "@/app/ui/commons/snippets";
import { useLocale } from "@/app/i18n";
import { widgetMessages } from "@/app/widgets/messages";
import "./styles.css";

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
  const [api, setApi] = useState(configuredApi() ?? fallbackApi);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const primaryApi = configuredApi();
    if (!primaryApi) {
      setUsingFallback(true);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const searchEndpoint = `${primaryApi}search?exact=false&obsoletes=false&q=*&groupField=true&rows=10&start=0&fieldList=description,label,iri,ontology_name,type,short_form`;

    fetch(searchEndpoint, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("API unavailable");
        setApi(primaryApi);
      })
      .catch(() => {
        setApi(fallbackApi);
        setUsingFallback(true);
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      {usingFallback && <WarningAlert message={t.fallbackWarning} />}
      {api && (
        <QueryClientProvider client={queryClient}>
          <SearchResultsListWidget
            api={api}
            initialItemsPerPage={10}
            itemsPerPageOptions={[10, 25, 50, 100]}
            onNavigateToOntology={() => undefined}
            parameter="fieldList=description,label,iri,ontology_name,type,short_form"
            preselected={[]}
            query="*"
            targetLink=""
            className="search-widget"
            useLegacy={false}
          />
        </QueryClientProvider>
      )}
    </>
  );
}
