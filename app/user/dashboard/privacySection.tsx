'use client'

import {RadioButton} from "@/app/ui/commons/snippets";
import {MATOMO_IS_ENABLED_FIELD} from "@/app/matomo/useMatomo";

export default function UserPrivacySection() {
    let matomoIsEnabledSetting = localStorage.getItem(MATOMO_IS_ENABLED_FIELD);
    let matomoIsEnabled = !!(matomoIsEnabledSetting && matomoIsEnabledSetting === "true");
    return (
        <>
            <p className="header-4">Privacy</p>
            <div className="flex">
                <p className="mr-2 mt-2">{"You agree to our use of tracking for analytics and performance purposes:"}</p>
                <RadioButton id={"radio-yes"} label={"Yes"} disabled={false} value={"yes"}
                             checked={matomoIsEnabled}></RadioButton>
                <RadioButton id={"radio-no"} label={"No"} disabled={false} value={"no"}
                             checked={!matomoIsEnabled}></RadioButton>
            </div>
        </>
    );
}