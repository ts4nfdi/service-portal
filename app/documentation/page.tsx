import ExpandableImage from "../ui/commons/ExpandableImage";
import { getRequestLocale } from "../libs/locale";
import { documentationMessages } from "./messages";
import { localizePath } from "../libs/localePath";

export default async function Documentation() {
  const locale = await getRequestLocale();
  const t = documentationMessages[locale];
  return (
    <div className="md:col-span-2">
      <p className="header-1">{t.title}</p>
      <p className="text-justify">
        {t.intro}
      </p>
      <br />

      <label htmlFor="list-of-content"><b>{t.content}</b></label>
      <ol id="list-of-content" className="pl-8">
        <li><a href="#architecture">{t.architecture}</a></li>
        <li><a href="#service-portal">{t.servicePortal}</a></li>
        <li><a href="#tss">{t.tss}</a></li>
        <li><a href="#mapping-service">{t.mappingService}</a></li>
        <li><a href="#gateway">{t.apiGateway}</a></li>
      </ol>

      <a href="#architecture"><p className="header-2" id="architecture">1. {t.architecture}</p></a>
      <p className="text-justify">
        {t.architecture1}
      </p>
      <p className="text-justify">
        {t.architecture2Start}
        <a href="#tss">{t.architecture2Tss}</a>{t.architecture2Middle1}
        <a href={localizePath("/incubators", locale)} target="_blank">{t.architecture2Dashboard}</a>{t.architecture2Middle2}
        <a href="#gateway">{t.architecture2Gateway}</a>{t.architecture2Middle3}
        <a href="#mapping-service">{t.architecture2Mapping}</a>{t.architecture2End}
      </p>

      <br />
      <ExpandableImage
        imagePath="/img/architecture.svg"
        width={800}
        height={800}
        altText={t.imageAlt}
      />

      <a href="#service-portal"><p className="header-2" id="service-portal">2. {t.servicePortal}</p></a>
      <p className="text-justify">
        {t.servicePortalBody}
      </p>

      <a href="#tss"><p className="header-2" id="tss">3. {t.tss}</p></a>
      <p className="text-justify">
        {t.tssBodyStart}
        <a href="https://terminology.services.base4nfdi.de/tss/comp/latest/?path=/docs/overview--docs" target="_blank">{t.tssStorybook}</a>
      </p>

      <a href="#mapping-service"><p className="header-2" id="mapping-service">4. {t.mappingService}</p></a>
      <p className="text-justify">
        {t.mappingBody}
      </p>
      <p className="text-justify">
        {t.mappingVersion}
        <a href="https://coli-conc.gbv.de/cocoda/ts4nfdi/" target="_blank">https://coli-conc.gbv.de/cocoda/ts4nfdi/</a>
      </p>

      <a href="#gateway"><p className="header-2" id="gateway">5. {t.apiGateway}</p></a>
      <p className="text-justify">
        {t.gatewayBodyStart}
        <li className="p-4 list-item">
          {t.gatewayApi}
        </li>
        <li className="p-4 list-item">
          {t.gatewayCrossDomain}
        </li>
        <li className="p-4 list-item">
          {t.gatewayRouting}
        </li>
      </p>
      <p className="text-justify">
        {t.gatewayDocs}
        <a href="https://ts4nfdi.github.io/api-gateway/" target="_blank">https://ts4nfdi.github.io/api-gateway/</a>
      </p>
    </div>
  );
}
