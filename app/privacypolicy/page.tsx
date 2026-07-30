
"use client";

import { useLocale } from "../i18n";
import { privacyPolicyMessages } from "./messages";

export default function PrivacyPolicy() {
  const t = privacyPolicyMessages[useLocale()];
  return (
    <div className="col-span-3 content-panel">
      <p className="header-2">{t.title}</p>
      <p>
        {t.body}
      </p>
      <p>
        {t.linkLabel}
        <a href="https://www.zbmed.de/en/privacy-policy" target="_blank">https://www.zbmed.de/en/privacy-policy</a>
      </p>
    </div>
  );
}
