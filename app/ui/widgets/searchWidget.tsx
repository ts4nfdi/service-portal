
'use client'

import dynamic from 'next/dynamic';
import { SearchResultsListWidgetProps } from '@ts4nfdi/terminology-service-suite';

const SearchResultsListWidget = dynamic<SearchResultsListWidgetProps>(() =>
  import("@ts4nfdi/terminology-service-suite").then((mod) => mod.SearchResultsListWidget)
  , { ssr: false }) as React.ComponentType<SearchResultsListWidgetProps>;

import { QueryClient, QueryClientProvider } from "react-query";
import './styles.css';
import { useLocale } from '@/app/i18n';
import { widgetUiMessages } from './messages';


export default function SearchResultsListWidgetTSS() {
  const t = widgetUiMessages[useLocale()];
  const queryClient = new QueryClient();

  return (
    <>
      <p className='header-2'>SearchResultsListWidget</p>
      <p>{t.searchBody}<b>DataPLANT</b>{t.searchBodyEnd}</p>
      <QueryClientProvider client={queryClient}>
        <SearchResultsListWidget
          api="https://api.terminology.tib.eu/api/"
          initialItemsPerPage={10}
          itemsPerPageOptions={[
            10,
            25,
            50,
            100
          ]}
          parameter="classification=DataPLANT&schema=collection&fieldList=description,label,iri,ontology_name,type,short_form"
          preselected={[]}
          query="*"
          targetLink=""
          useLegacy={false}
          className='search-widget'

        />
      </QueryClientProvider>
    </>
  );
}
