'use client'

import { LeftArrowIcon } from "@/app/ui/commons/icons";
import TerminologyListWidgetTSS from "@/app/ui/widgets/terminologyList";
import { widgetMessages } from "../messages";
import { useLocale } from "@/app/i18n";
import { localizePath } from "@/app/libs/localePath";


export default function TerminologtList() {
  const locale = useLocale();
  const t = widgetMessages[locale];

  return (
    <div className="md:col-span-3">
      <a className="btn" href={localizePath("/widgets/", locale)}><LeftArrowIcon /> {t.back}</a>
      <p className="header-1">{t.terminologyList}</p>
      <TerminologyListWidgetTSS />
    </div>
  )
}
