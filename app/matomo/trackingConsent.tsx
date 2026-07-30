'use client'

import {useState, useEffect} from "react";
import {MATOMO_IS_ENABLED_FIELD} from "@/app/matomo/useMatomo";
import { useLocale } from "@/app/i18n";
import { trackingConsentMessages } from "./messages";
import { localizePath } from "@/app/libs/localePath";

export default function TrackingConsentFormComponent() {
    const locale = useLocale();
    const t = trackingConsentMessages[locale];
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        let matomoIsEnabled = localStorage.getItem(MATOMO_IS_ENABLED_FIELD);
        if (!matomoIsEnabled) {
            setShowModal(true);
            return;
        }
    }, [])

    return (
        <>
            {showModal &&
              <div id="static-modal" data-modal-backdrop="static" tabIndex={-1} aria-hidden="true"
                   className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                <div className="m-auto relative p-4 w-full max-w-2xl max-h-full">
                  <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                    <div
                      className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {t.title}
                      </h3>
                    </div>
                    <div className="p-4 md:p-5 space-y-4">
                      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                        {t.intro}
                      </p>
                      <ul className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                        <li>{t.use1}</li>
                        <li>{t.use2}</li>
                        <li>{t.use3}</li>
                      </ul>
                      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                        {t.noAds}<b>{t.not}</b>{t.noAdsEnd}<br/>
                        {t.acceptText}<b>{`"${t.accept}"`}</b>{t.acceptEnd}
                      </p>
                      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                        {t.readMore}
                        <a href={localizePath("/termsofuse", locale)}>{t.terms}</a>

                      </p>
                    </div>
                    <div
                      className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                      <button data-modal-hide="static-modal" type="button"
                              className="btn"
                              onClick={() => {
                                  setShowModal(false);
                                  localStorage.setItem(MATOMO_IS_ENABLED_FIELD, "true");
                              }
                              }
                      >
                        {t.acceptButton}
                      </button>
                      <button data-modal-hide="static-modal" type="button"
                              className="btn !bg-white !text-black !border !border-gray-200 !ml-auto"
                              onClick={() => {
                                  setShowModal(false);
                                  localStorage.setItem(MATOMO_IS_ENABLED_FIELD, "false");
                              }}
                      >
                        {t.decline}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
        </>
    );
}
