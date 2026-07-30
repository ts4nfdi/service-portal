'use client'

import dynamic from "next/dynamic";
import {useState} from "react";
import {QueryClient, QueryClientProvider} from "react-query";
import {OntologyInfoWidgetProps} from "@ts4nfdi/terminology-service-suite";
import {Modal} from "@/app/ui/commons/modal";
import {PortalTerminology} from "@/app/concepts";
import {useLocale} from "@/app/i18n";
import {collectionUiMessages} from "@/app/ui/collection/messages";

const OntologyInfoWidget = dynamic<OntologyInfoWidgetProps>(() =>
    import("@ts4nfdi/terminology-service-suite").then((mod) => mod.OntologyInfoWidget)
, {ssr: false}) as React.ComponentType<OntologyInfoWidgetProps>;

const DEFAULT_API = "https://api.terminology.tib.eu/api";

const DATABASES: Record<string, {type: string, url: string}> = {
    agroportal: {type: "ontoportal", url: "https://data.agroportal.eu"},
    earthportal: {type: "ontoportal", url: "https://data.earthportal.eu"},
    biodivportal: {type: "ontoportal", url: "https://data.biodivportal.gfbio.org"},
    ecoportal: {type: "ontoportal", url: "https://data.ecoportal.lifewatch.eu"},
    lovportal: {type: "ontoportal", url: "https://data.lovportal.lirmm.fr"},
    ebi: {type: "ols2", url: "https://www.ebi.ac.uk/ols4/api/v2"},
    tib: {type: "ols", url: "https://api.terminology.tib.eu/api"},
    zbmed: {type: "ols", url: "https://semanticlookup.zbmed.de/ols/api"},
    agrovoc: {type: "skosmos", url: "https://agrovoc.fao.org/browse/rest/v1"},
    gnd: {type: "gnd", url: "https://lobid.org"},
    dante: {type: "jskos", url: "https://api.dante.gbv.de"},
    "coli-conc": {type: "jskos2", url: "https://coli-conc.gbv.de/api"},
    iconclass: {type: "jskos2", url: "https://test.iconclass.org/api/jskos"},
    nerc: {type: "nerc", url: "https://vocab.nerc.ac.uk"},
};

type CmpProps = {
    terminology: PortalTerminology,
    collectionId?: string
}

function modalSafeId(value: string) {
    return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export default function TerminologyInfoModal(props: CmpProps) {
    const t = collectionUiMessages[useLocale()];
    const [queryClient] = useState(() => new QueryClient());
    const [isOpen, setIsOpen] = useState(false);
    const database = DATABASES[props.terminology.source.toLowerCase()];
    const api = database?.url ?? DEFAULT_API;
    const ontologyId = props.terminology.label.trim().toLowerCase();
    const modalId = modalSafeId(`terminology-info-${props.collectionId ?? "collection"}-${props.terminology.source}-${props.terminology.label}`);

    function openModal() {
        const modal = document.getElementById(modalId)! as HTMLDivElement;
        setIsOpen(true);
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        (modal.previousSibling as HTMLDivElement).classList.remove("hidden");
    }

    return (
        <>
            <button
                aria-label={`${t.showOntologyInfo} ${props.terminology.label}`}
                className="badge terminology-badge terminology-badge-button"
                onClick={openModal}
                title={`${t.showOntologyInfo} ${props.terminology.label}`}
                type="button"
            >
                {props.terminology.label} ({props.terminology.source})
            </button>
            <Modal
                id={modalId}
                title={`${props.terminology.label} (${props.terminology.source})`}
                content={
                    isOpen &&
                    <QueryClientProvider client={queryClient}>
                        <OntologyInfoWidget
                            api={api}
                            ontologyId={ontologyId}
                            parameter=""
                            useLegacy={database?.type === "ols2"}
                            hasTitle={false}
                            showBadges
                            className="ontology-info-widget"
                        />
                    </QueryClientProvider>
                }
                withCloseBtn
            />
        </>
    );
}
