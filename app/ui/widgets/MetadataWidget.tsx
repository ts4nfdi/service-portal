'use client'

import dynamic from 'next/dynamic';
import { MetadataWidgetProps } from '@ts4nfdi/terminology-service-suite';

const MetadataWidget = dynamic<MetadataWidgetProps>(() =>
  import("@ts4nfdi/terminology-service-suite").then((mod) => mod.MetadataWidget)
  , { ssr: false }) as React.ComponentType<MetadataWidgetProps>;

import { QueryClient, QueryClientProvider } from "react-query";
import { AutoCompleteSelectedTermType } from './types';
import './styles.css';
import { useLocale } from '@/app/i18n';
import { widgetUiMessages } from './messages';

type CmpProp = {
  selectedTerm: AutoCompleteSelectedTermType
}

export default function MetadataWidgetTSS(props: CmpProp) {
  const t = widgetUiMessages[useLocale()];
  const queryClient = new QueryClient();
  const selectedTerm = props.selectedTerm;

  let api = ""
  if (!selectedTerm) {
    api = ""
  } else if (selectedTerm.source === "ols-ebi") {
    api = "https://www.ebi.ac.uk/ols4/api/";
  } else if (selectedTerm.source === 'tib') {
    api = "https://api.terminology.tib.eu/api/";
  } else if (selectedTerm.source === 'agroportal') {
    api = "https://data.agroportal.lirmm.fr/";
  } else if (selectedTerm.source === 'biodivportal') {
    api = "https://data.biodivportal.gfbio.org/"
  } else {
    api = "https://api.terminology.tib.eu/api/";
  }

  return (
    <>
      <p className='header-2'>MetadataWidget</p>
      {!selectedTerm &&
        <p className='header-4'>{t.metadataSelect}</p>
      }
      {selectedTerm &&
        <QueryClientProvider client={queryClient}>
          <MetadataWidget
            altNamesTab
            api={api}
            crossRefTab
            entityType="term"
            hierarchyTab
            iri={selectedTerm.iri ?? ""}
            // onNavigateToDisambiguate={}
            // onNavigateToEntity={}
            // onNavigateToOntology={}
            ontologyId={props.selectedTerm.ontology_name}
            parameter=""
            termLink=""
            terminologyInfoTab
            useLegacy={false}
            className='metadata-widget'
          />
        </QueryClientProvider>
      }
    </>
  );

}
