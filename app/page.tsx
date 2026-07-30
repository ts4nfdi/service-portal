"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "./i18n";
import { localizePath } from "./libs/localePath";

export default function Home() {
  const locale = useLocale();
  const t = useTranslations("Home");
  return (
    <div className="col-span-3 home-page-content">
      <div className="grid md:grid-cols-9 md:gap-4">
        <div className="md:col-span-9 h1-service-portal">
          <h1 className="header-main-1 float-right">
            <Image
              width={255}
              height={255}
              alt="TS4NFDI"
              src={"img/TS4NFDI-small-grey.svg"}
            />
            {t("title")}
          </h1>
        </div>
        <div className="md:col-span-5 card-background min-h-[50px]">
          <h3 className="header-main-3">{t("whatIs")}</h3>
          <p className="text-justify my-5">{t("intro1")}</p>
          <p className="text-justify my-5">{t("intro2")}</p>
          <p className="text-justify my-5">{t("intro3")}</p>
        </div>
        <div className="md:col-span-4 card-background float-right">
          <iframe
            className="w-full aspect-video self-stretch md:min-h-96"
            src="https://www.youtube.com/embed/OT4YUTvqKRI"
            frameBorder="0"
            title={t("videoTitle")}
            aria-hidden="true"
            allow="fullscreen"
            allowFullScreen
          />
        </div>
        <div className="md:col-span-9">
          <br />
          <br />
        </div>
        <div className="card-background md:col-span-9 grid md:grid-cols-9">
          <div className="md:col-span-3">
            <Image
              src={"img/TS4NFDI-Service-Portal-Hexagon-Dark.svg"}
              width={350}
              height={350}
              alt={t("portalLogoAlt")}
              placeholder="blur"
              blurDataURL="/blur.webp"
              style={{ margin: "auto" }}
            />
          </div>
          <div className="md:col-span-6">
            <h3 className="header-main-3 text-right">
              {t("aboutPortal")}
            </h3>
            <p className="text-justify my-5">{t("portal1")}</p>
            <p className="text-justify my-5">{t("portal2")}</p>
            <p className="text-justify my-5">
              {t("portal3Start")}
              <Link className="text-base" href={localizePath("/collection/", locale)}>{t("collections")}</Link>
              {t("portal3End")}
            </p>
          </div>
        </div>
        <div className="md:col-span-9">
          <h2 className="header-main-2">{t("tools")}</h2>
        </div>
        <div className="md:col-span-3 card-background">
          <Image
            src={"img/TS4NFDI-Terminology-Service-Suite-Hexagon-Dark.svg"}
            width={350}
            height={350}
            alt={t("tssLogoAlt")}
            placeholder="blur"
            blurDataURL="/blur.webp"
            style={{ margin: "auto" }}
          />
          <p className="text-justify my-5">{t("tss1")}</p>
          <p className="text-justify my-5">{t("tss2")}</p>
          <p className="text-right">
            <a className="text-base" href={localizePath("/documentation#tss", locale)}>
              {t("readMore")}
            </a>
          </p>
        </div>
        <div className="md:col-span-3 card-background">
          <Image
            src={"img/TS4NFDI-API-Gateway-Hexagon-Dark.svg"}
            width={350}
            height={350}
            alt={t("gatewayLogoAlt")}
            placeholder="blur"
            blurDataURL="/blur.webp"
            style={{ margin: "auto" }}
          />
          <p className="text-justify my-5">{t("gateway1")}</p>
          <p className="text-justify my-5">{t("gateway2")}</p>
          <p className="text-right">
            <a className="text-base" href={localizePath("/documentation#gateway", locale)}>
              {t("readMore")}
            </a>
          </p>
        </div>
        <div className="md:col-span-3 card-background">
          <Image
            src={"img/TS4NFDI-Mapping-Service-Hexagon-Dark.svg"}
            width={350}
            height={350}
            alt={t("mappingLogoAlt")}
            placeholder="blur"
            blurDataURL="/blur.webp"
            style={{ margin: "auto" }}
          />
          <p className="text-justify my-5">{t("mapping")}</p>
          <p className="text-right">
            <a className="text-base" href={localizePath("/documentation#mapping-service", locale)}>
              {t("readMore")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
