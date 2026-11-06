'use client'

import { downloadJson } from "@/app/ui/commons/downloadJson";
import {PortalCollectionJsonData} from "@/app/concepts";
import {DownloadIcon} from "@/app/ui/commons/icons";
import { useLocale } from "@/app/i18n";
import { collectionUiMessages } from "./messages";

export default function DownloadCollectionsButton(props: { collections: PortalCollectionJsonData[] }) {
    const t = collectionUiMessages[useLocale()];
    function downloadAllCollectionsJsonData() {
        const publicCollections = props.collections.filter((collection) => collection.isPublic);
        downloadJson(publicCollections, "collections.json");
    }

    return (
        <button
            aria-label={t.downloadAllPublicJson}
            className="btn !p-2 !text-sm mt-10 float-right flex items-center gap-2"
            onClick={downloadAllCollectionsJsonData}
            title={t.downloadPublicJson}
            type="button"
        >
            <DownloadIcon/>
            <p className="inline ml-2">{t.downloadAllPublic}</p>
        </button>
    );
}
