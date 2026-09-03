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
  selectedTerm: AutoCompleteSelectedTermType,
  api?: string,
  showTitle?: boolean
}

function entityType(type?: string): MetadataWidgetProps["entityType"] {
  if (type === "class" || type === "property" || type === "individual") return type;
  return "term";
}

export default function MetadataWidgetTSS(props: CmpProp) {
  const t = widgetUiMessages[useLocale()];
  const queryClient = new QueryClient();
  const selectedTerm = props.selectedTerm;

  let api = props.api ?? ""
  if (!api && !selectedTerm) {
    api = ""
  } else if (!api && selectedTerm.source === "ols-ebi") {
    api = "https://www.ebi.ac.uk/ols4/api/";
  } else if (!api && selectedTerm.source === 'tib') {
    api = "https://api.terminology.tib.eu/api/";
  } else if (!api && selectedTerm.source === 'agroportal') {
    api = "https://data.agroportal.lirmm.fr/";
  } else if (!api && selectedTerm.source === 'biodivportal') {
    api = "https://data.biodivportal.gfbio.org/"
  } else if (!api) {
    api = "https://api.terminology.tib.eu/api/";
  }

  return (
    <>
      {props.showTitle !== false && <p className='header-2'>MetadataWidget</p>}
      {!selectedTerm &&
        <p className='header-4'>{t.metadataSelect}</p>
      }
      {selectedTerm &&
        <QueryClientProvider client={queryClient}>
          <MetadataWidget
            altNamesTab
            api={api}
            crossRefTab
            entityType={entityType(selectedTerm.type)}
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
