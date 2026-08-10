"use client";

import { useLocale } from "../i18n";
import { termsMessages } from "./messages";
import { localizePath } from "../libs/localePath";

export default function TermsOfUse() {
  const locale = useLocale();
  const t = termsMessages[locale];
  return (
    <div className="col-span-3 content-panel">
      <p className="header-2">{t.title}</p>
      <p><b>{t.status}</b></p>
      <p className="text-justify">
        <a href="https://www.zbmed.de/en/privacy-policy" target="_blank" className="!pl-0">{t.privacy}</a> {t.intro}
        <br /><br />
        {t.providedBy}
        <br /><br />
        Deutsche Zentralbibliothek für Medizin (ZB MED) - Informationszentrum Lebenswissenschaften
        <br />
        {t.director}
        <br />
        Gleueler Strasse 60
        <br />
        50931 Köln
        <br />
        {t.germany}
        <br />
        {t.phone}
        <br />
        {t.email}
        <br />
        {t.website}
        <br />
      </p>

      <p className="header-2 !mt-10"><b>{t.scopeTitle}</b></p>
      <p className="text-justify" dangerouslySetInnerHTML={{ __html: t.scope }} />

      <p className="header-2 !mt-10"><b>{t.registrationTitle}</b></p>
      <p className="text-justify" dangerouslySetInnerHTML={{ __html: t.registration }} />

      <p className="header-2 !mt-10"><b>{t.portalTitle}</b></p>
      <p className="text-justify" dangerouslySetInnerHTML={{ __html: t.portal }} />

      <p className="header-2 !mt-10"><b>{t.functionalityTitle}</b></p>
      <p className="text-justify">
        <span dangerouslySetInnerHTML={{ __html: t.functionalityStart }} />
        <a href={localizePath("/documentation#gateway", locale)} target="_blank">API Gateway</a>
        {t.functionalityMiddle}
        <a href={localizePath("/documentation#tss", locale)} target="_blank">TSS widgets</a>
        {t.functionalityEnd}
      </p>

      <p className="header-2 !mt-10"><b>{t.rightsTitle}</b></p>
      <p className="text-justify" dangerouslySetInnerHTML={{ __html: t.rights }} />

      <p className="header-2 !mt-10"><b>{t.miscTitle}</b></p>
      <p className="text-justify" dangerouslySetInnerHTML={{ __html: t.misc }} />
    </div>
  );
}
