"use client";

import {PortalCollectionStatistics} from "@/app/concepts";
import {useLocale} from "@/app/i18n";
import {collectionUiMessages} from "./messages";

export default function CollectionStatistics({statistics, variant = "panel"}: {
    statistics?: PortalCollectionStatistics;
    variant?: "card" | "panel";
}) {
    const locale = useLocale();
    const t = collectionUiMessages[locale];

    return (
        <section className={variant === "card" ? "collection-card-statistics" : "collection-statistics"} aria-label={t.statistics}>
            {variant === "panel" && <h2 className="mb-2 font-bold">{t.statistics}</h2>}
            {statistics ? (
                <>
                    <dl className="space-y-2 text-sm">
                        {(["properties", "classes", "namedIndividuals", "concepts"] as const).map((key) => (
                            <div key={key} className="flex justify-between gap-4">
                                <dt>{t[key]}</dt>
                                <dd className="font-semibold tabular-nums">{statistics[key]?.toLocaleString(locale) ?? "—"}</dd>
                            </div>
                        ))}
                    </dl>
                    <p className="!mb-0 mt-3 !px-0 text-xs">
                        {t.statisticsCreated}: <time dateTime={statistics.created}>{statistics.created}</time>
                    </p>
                </>
            ) : <p className="!mb-0 !px-0 text-sm">{t.statisticsUnavailable}</p>}
        </section>
    );
}
