"use client";

import { useLocale } from "../i18n";
import { imprintMessages } from "./messages";

export default function Imprint() {
  const t = imprintMessages[useLocale()];
  return (
    <div className="col-span-3 content-panel">
      <p className="header-2">{t.title}</p>
      <p>
        {t.body}
      </p>
      <p>
        {t.linkLabel}
        <a href="https://www.zbmed.de/en/legal-notice" target="_blank">https://www.zbmed.de/en/legal-notice</a>
      </p>
    </div>
  );
}
