'use client'

import dynamic from 'next/dynamic';
import { ResourcesWidgetProps } from '@ts4nfdi/terminology-service-suite';

const ResourcesWidget = dynamic<ResourcesWidgetProps>(() =>
  import("@ts4nfdi/terminology-service-suite").then((mod) => mod.ResourcesWidget)
  , { ssr: false }) as React.ComponentType<ResourcesWidgetProps>;

import { QueryClient, QueryClientProvider } from "react-query";
import { useLocale } from '@/app/i18n';
import { widgetUiMessages } from './messages';


export default function TerminologyListWidgetTSS() {
  const t = widgetUiMessages[useLocale()];
  const queryClient = new QueryClient();

  return (
    <>
      <p className='header-2'>ResourcesWidget</p>
      <p>{t.resourcesBody}<b>Zbmed</b>{t.resourcesBodyEnd}</p>
      <QueryClientProvider client={queryClient}>
        <ResourcesWidget
          actions={[]}
          api="https://semanticlookup.zbmed.de/ols/api/"
          initialEntriesPerPage={100}
          initialSortDir="asc"
          initialSortField="config.preferredPrefix"
          onNavigate={function noRefCheck() { }}
          pageSizeOptions={[
            10,
            25,
            50,
            100
          ]}
          parameter="collection=nfdi4health"
          useLegacy
          className='resources-widget'
        />
      </QueryClientProvider>
    </>
  );
}
