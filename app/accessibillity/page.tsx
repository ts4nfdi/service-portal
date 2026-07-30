"use client";

import { useLocale } from "../i18n";
import { accessibilityMessages } from "./messages";

export default function Accessibillity() {
  const t = accessibilityMessages[useLocale()];
  return (
    <div className="col-span-3 content-panel">
      <p className="header-2">{t.title}</p>
      <p>
        {t.body}
      </p>
      <p>
        {t.linkLabel}
        <a href="https://base4nfdi.de/accessibility" target="_blank">https://base4nfdi.de/accessibility</a>
      </p>
    </div>
  );
}
