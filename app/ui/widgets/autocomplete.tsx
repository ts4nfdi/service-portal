'use client'

import dynamic from 'next/dynamic';
import { AutocompleteWidgetProps } from '@ts4nfdi/terminology-service-suite';

const AutocompleteWidget = dynamic<AutocompleteWidgetProps>(() =>
  import("@ts4nfdi/terminology-service-suite").then((mod) => mod.AutocompleteWidget)
  , { ssr: false }) as React.ComponentType<AutocompleteWidgetProps>;;

import { QueryClient, QueryClientProvider } from "react-query";
import { AutoCompleteSelectedTermType } from './types';
import './styles.css';
import { useLocale } from '@/app/i18n';
import { widgetUiMessages } from './messages';


type CmpType = {
  setSelectedTerm: (terms: AutoCompleteSelectedTermType[]) => void,
  withDescription?: boolean,
  label?: string,
  required?: boolean,
  singleSelect?: boolean,
  className?: string,
  placeholder?: string,
  parameter?: string,
  api?: string,
  preselected?: { "label": string, "iri": string, "source": string }[]
}

export default function AutoCompleteTSS(props: CmpType) {
  const t = widgetUiMessages[useLocale()];
  const queryClient = new QueryClient();

  function handleSelection(terms: AutoCompleteSelectedTermType[]) {
    props.setSelectedTerm(terms);
  }

  return (
    <>
      {props.withDescription &&
        <p className="header-2" key={"widget-name"}>AutocompleteWidget</p>
      }
      <QueryClientProvider client={queryClient}>
        {props.withDescription &&
          <>
            <p>
              <b>
                {t.autocompleteHelp}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 inline">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                </svg>
              </b>
            </p>
            <p>
              {t.autocompleteBody}
              <a
                href={process.env.NEXT_PUBLIC_AUTOCOMPLETE_DOCUMENTATION_URL}
                target='_blank'
              >{t.autocompleteStorybook}</a>
            </p>
            <p><b>API:</b> {process.env.NEXT_PUBLIC_API_GATEWAY_ENDPOINT}</p>
          </>
        }
        <div className='w-full autocomplete-in-form' key={"autocomplete-box"}>
          {props.label && <label htmlFor='' className={"block " + (props.required ? "required-label" : "")}>{props.label}</label>}
          <AutocompleteWidget
            api={props.api ?? process.env.NEXT_PUBLIC_API_GATEWAY_ENDPOINT as string}
            hasShortSelectedLabel={true}
            parameter={props.parameter ?? process.env.NEXT_PUBLIC_API_GATEWAY_DEFAULT_PARAMETERS as string}
            placeholder={props.placeholder ?? t.searchPlaceholder}
            preselected={props.preselected ?? []}
            allowCustomTerms={props.preselected ? true : false}
            selectionChangedEvent={handleSelection}
            showApiSource={true}
            singleSelection={props.singleSelect}
            className={props.className ?? "" + " autocomplete-widget"}
          />
        </div>
      </QueryClientProvider>
    </>
  );
}
