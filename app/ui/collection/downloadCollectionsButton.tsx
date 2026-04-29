'use client'

import {PortalCollectionJsonData} from "@/app/concepts";
import {DownloadIcon} from "@/app/ui/commons/icons";

export default function DownloadCollectionsButton(props: { collections: PortalCollectionJsonData[] }) {
    function downloadAllCollectionsJsonData() {
        const publicCollections = props.collections.filter((collection) => collection.isPublic);
        const json = JSON.stringify(publicCollections, null, 2);
        const blob = new Blob([json], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "collections.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    return (
        <button
            aria-label="Download all public collections as JSON"
            className="btn !p-2 !text-sm mt-10 float-right flex items-center gap-2"
            onClick={downloadAllCollectionsJsonData}
            title="Download public collections as JSON"
            type="button"
        >
            <DownloadIcon/>
            <p className="inline ml-2">Download all public collections (JSON)</p>
        </button>
    );
}
