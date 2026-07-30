"use client";

import AboutPeople from "../ui/about/people";
import { useLocale, useTranslations } from "../i18n";
import { localizePath } from "../libs/localePath";


export default function About() {
  const locale = useLocale();
  const t = useTranslations("About");
  return (
    <div className="md:col-span-3 grid grid-rows-1">
      <div className="grid grid-rows-1 mb-2" key={'goals'}>
        <p className="text-justify" key={1}>
          {t("intro")}
        </p>
        <p className="text-justify" key={2}>
          {t("phase")}
        </p>
        <ul>
          <li className="text-justify list-item" key={1}>
            <a href={localizePath("/documentation#service-portal", locale)}>{t("servicePortalLabel")}</a>{t("portal")}
          </li>
          <li className="text-justify list-item" key={2}>
            <a href={localizePath("/documentation#mapping-service", locale)}>{t("mappingServiceLabel")}</a>{t("mapping")}
          </li>
          <li className="text-justify list-item" key={4}>
            <a href={localizePath("/documentation#gateway", locale)}>{t("apiGatewayLabel")}</a>{t("gateway")}
          </li>
          <li className="text-justify list-item" key={5}>
            <a href={localizePath("/documentation#tss", locale)}>{t("tssLabel")}</a>{t("tss")}
          </li>
          <li className="text-justify list-item" key={3}>
            {t("workflows")}
          </li>
        </ul>
      </div>
      <AboutPeople key={'people'} />

    </div>
  );
}
