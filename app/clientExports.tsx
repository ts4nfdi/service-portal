"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import type { PortalSourcesJsonData } from "@/app/concepts";
import { CardSkeleton, DefaultSkeleton } from "@/app/ui/commons/skeletons";
import { useLocale } from "./i18n";

const providerMessages = {
  en: {
    homePage: "Home Page:",
    contact: "Contact:",
    providerSingular: "terminology provider",
    providerPlural: "terminology providers",
    available: "available",
    total: "total",
    allTypes: "All types",
  },
  de: {
    homePage: "Homepage:",
    contact: "Kontakt:",
    providerSingular: "Terminologieanbieter",
    providerPlural: "Terminologieanbieter",
    available: "verfuegbar",
    total: "gesamt",
    allTypes: "Alle Typen",
  },
} as const;

export function ProviderCard({
  provider,
}: {
  provider: PortalSourcesJsonData;
}) {
  const t = providerMessages[useLocale()];
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  const providerTitle = provider.title ? provider.title : provider.name;

  return (
    <div
      className={
        "card provider-card flex flex-col !p-8 " +
        (isLogoLoaded ? "provider-card-loaded" : "")
      }
    >
      <div className="flex flex-row gap-2 mb-2" key="db-name">
        <p className="header-4 inline-block">{providerTitle}</p>
      </div>
      <div
        className="provider-card-logo-wrap w-full p-4 m-2"
        key={"image"}
        style={{ backgroundColor: provider.logo_background_color }}
      >
        <Image
          src={provider.logo}
          width={provider.logoW}
          height={provider.logoH}
          alt={providerTitle}
          className="provider-card-logo mx-auto"
          onLoad={() => setIsLogoLoaded(true)}
          onError={() => setIsLogoLoaded(true)}
        />
      </div>
      <div className="flex items-center mt-2 mb-3" key="homepage-url">
        <b className="me-2">{t.homePage}</b>
        <a href={provider.homePage} className="mt-1" target={"_blank"}>
          {provider.homePage}
        </a>
        <CopyToClipboard
          textToCopy={provider.homePage}
          key="copy-url-homepage"
        />
      </div>
      <div className="flex items-center mt-2 mb-3" key="contact-url">
        <b className="me-2">{t.contact}</b>
        <a href={provider.contactUrl} className="mt-1" target={"_blank"}>
          {provider.contactUrl}
        </a>
        <CopyToClipboard
          textToCopy={provider.contactUrl}
          key="copy-url-contact"
        />
      </div>
      <div className="flex items-center mt-2" key="db-url">
        <b className="me-2">API:</b>
        <a href={provider.url} className="mt-1" target={"_blank"}>
          {provider.url}
        </a>
        <CopyToClipboard textToCopy={provider.url} key="copy-url" />
      </div>
      <div className="flex flex-row gap-2 mt-8 text-justify" key="db-type">
        {provider.description}
      </div>
    </div>
  );
}

export function ProviderList({
  providers,
}: {
  providers: PortalSourcesJsonData[];
}) {
  const t = providerMessages[useLocale()];
  const [selectedType, setSelectedType] = useState("all");
  const providerTypes = Array.from(
    new Set(providers.map((provider) => provider.type).filter(Boolean)),
  ).sort();
  const filteredProviders =
    selectedType === "all"
      ? providers
      : providers.filter((provider) => provider.type === selectedType);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="provider-count text-left text-sm font-semibold text-[var(--siteMainColor)] dark:text-white">
          {filteredProviders.length} {filteredProviders.length === 1 ? t.providerSingular : t.providerPlural} {t.available}
          {selectedType === "all" ? (
            ""
          ) : (
            <span> ({providers.length} {t.total})</span>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--siteMainColor)] dark:text-white">
          <select
            className="min-w-48"
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
          >
            <option value="all">{t.allTypes}</option>
            {providerTypes.map((providerType) => (
              <option value={providerType} key={providerType}>
                {providerType}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid md:grid-cols-3 grid-cols-1 gap-4 w-full">
        {filteredProviders.map((provider) => {
          return (
            <ProviderCard
              provider={provider}
              key={provider.title ? provider.title : provider.name}
            />
          );
        })}
      </div>
    </>
  );
}

export const CollectionPageContent = dynamic(
  () => import("@/app/collection/[collectionId]/content"),
  {
    ssr: false,
  },
);

export const MatomoTracker = dynamic(() => import("@/app/matomo/useMatomo"), {
  ssr: false,
});

export const TrackingConsentForm = dynamic(
  () => import("@/app/matomo/trackingConsent"),
  {
    ssr: false,
  },
);

export const UserPrivacySection = dynamic(
  () => import("@/app/user/dashboard/privacySection"),
  {
    ssr: false,
  },
);

export const CopyToClipboard = dynamic(
  () =>
    import("@/app/ui/commons/snippets").then((mod) => mod.CopyToClipboardCmp),
  {
    ssr: false,
  },
);

export const InfoAlert = dynamic(
  () => import("@/app/ui/commons/snippets").then((mod) => mod.InfoAlertCmp),
  {
    ssr: false,
    loading: () => <DefaultSkeleton lineCount={3} className="px-4 py-3 mb-4" />,
  },
);

export const CollectionList = dynamic(
  () => import("@/app/ui/collection/collectionList"),
  {
    ssr: false,
    loading: () => <CardSkeleton count={5} className="" />,
  },
);

export const PublicationCards = dynamic(
  () => import("@/app/ui/publication/publicationCard"),
  {
    ssr: false,
    loading: () => <CardSkeleton count={5} className="" />,
  },
);

export const Pagination = dynamic(() => import("@/app/ui/commons/pagination"), {
  ssr: false,
});
