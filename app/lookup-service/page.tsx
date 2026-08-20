import LookupServiceWidget from "@/app/ui/widgets/lookupService";
import { getRequestLocale } from "@/app/libs/locale";
import { widgetMessages } from "@/app/widgets/messages";
import { Suspense } from "react";

export default async function LookupServicePage() {
  const t = widgetMessages[await getRequestLocale()];

  return (
    <div className="md:col-span-3">
      <p className="header-1">{t.lookupTitle}</p>
      <div className="overflow-hidden break-words widget-box">
        <Suspense>
          <LookupServiceWidget />
        </Suspense>
      </div>
    </div>
  );
}
