'use client'

import AutoCompleteTSS from "@/app/ui/widgets/autocomplete"
import MetadataWidgetTSS from "@/app/ui/widgets/MetadataWidget"
import { useState } from "react";
import { AutoCompleteSelectedTermType } from "@/app/ui/widgets/types";
import { LeftArrowIcon } from "@/app/ui/commons/icons";
import { widgetMessages } from "../messages";
import { useLocale } from "@/app/i18n";
import { localizePath } from "@/app/libs/localePath";


export default function TermLookup() {
  const locale = useLocale();
  const t = widgetMessages[locale];

  const [selectedTerm, setSelectedTerm] = useState<AutoCompleteSelectedTermType[]>([]);


  return (
    <div className="md:col-span-3">
      <a className="btn" href={localizePath("/widgets/", locale)}><LeftArrowIcon /> {t.back}</a>
      <p className="header-1">{t.termLookup}</p>
      <div className="grid md:grid-cols-3 grid-rows-1 gap-10">
        <div className="md:col-span-1 overflow-hidden break-words widget-box">
          <AutoCompleteTSS
            setSelectedTerm={(terms: AutoCompleteSelectedTermType[]) => { setSelectedTerm(terms) }}
            withDescription
            singleSelect
          />
        </div>
        <div className="md:col-span-2 widget-box">
          <MetadataWidgetTSS selectedTerm={selectedTerm?.[0]} />
        </div>
      </div>
    </div>
  )
}
