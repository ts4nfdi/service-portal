
'use client'

import { LeftArrowIcon } from "@/app/ui/commons/icons";
import SearchResultsListWidgetTSS from "@/app/ui/widgets/searchWidget";
import { widgetMessages } from "../messages";
import { useLocale } from "@/app/i18n";
import { localizePath } from "@/app/libs/localePath";


export default function TerminologtList() {
  const locale = useLocale();
  const t = widgetMessages[locale];

  return (
    <div className="md:col-span-3">
      <a className="btn" href={localizePath("/widgets/", locale)}><LeftArrowIcon /> {t.back}</a>
      <p className="header-1">{t.searchTitle}</p>
      <div className="grid md:grid-cols-1 grid-rows-1 gap-10">
        <div className="overflow-hidden break-words widget-box">
          <SearchResultsListWidgetTSS />
        </div>
      </div>
    </div>
  )
}
