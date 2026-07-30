'use client'

import {RadioButton} from "@/app/ui/commons/snippets";
import {MATOMO_IS_ENABLED_FIELD} from "@/app/matomo/useMatomo";
import { useLocale } from "@/app/i18n";
import { userPageMessages } from "../messages";

export default function UserPrivacySectionComponent() {
    const t = userPageMessages[useLocale()];
    let matomoIsEnabledSetting = localStorage.getItem(MATOMO_IS_ENABLED_FIELD);
    let matomoIsEnabled = !!(matomoIsEnabledSetting && matomoIsEnabledSetting === "true");
    return (
        <>
            <p className="header-4">{t.privacy}</p>
            <div className="flex">
                <p className="mr-2 mt-2">{t.trackingConsent}</p>
                <RadioButton id={"radio-yes"} label={t.yes} disabled={false} value={"yes"}
                             checked={matomoIsEnabled}></RadioButton>
                <RadioButton id={"radio-no"} label={t.no} disabled={false} value={"no"}
                             checked={!matomoIsEnabled}></RadioButton>
            </div>
        </>
    );
}

